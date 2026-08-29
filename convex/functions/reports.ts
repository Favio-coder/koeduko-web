import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { api } from "../_generated/api";

export const generateSessionReport = mutation({
  args: {
    vapiCallId: v.string(),
  },
  handler: async (ctx, args) => {
    const vapiSession = await ctx.db
      .query("vapi_sessions")
      .withIndex("by_call", (q) => q.eq("vapiCallId", args.vapiCallId))
      .first();

    if (!vapiSession) return null;

    // El reporte puede dispararse dos veces: por el end-of-call-report de Vapi
    // y por el cierre manual desde la interfaz. Sin este corte la sesión
    // terminaría con reportes duplicados por usuario.
    const yaGenerado = await ctx.db
      .query("session_reports")
      .withIndex("by_session", (q) => q.eq("sessionId", vapiSession.sessionId))
      .first();

    if (yaGenerado) return null;

    const transcriptions = await ctx.db
      .query("transcriptions")
      .withIndex("by_session", (q) => q.eq("vapiSessionId", vapiSession._id))
      .collect();

    if (transcriptions.length === 0) return null;

    // La participación se mide contra las intervenciones de estudiantes, no
    // contra el total: ahora se transcribe también al asistente, y contarlo
    // diluiría el porcentaje de todos. Las filas viejas no tienen `role`, así
    // que se asumen del estudiante, que era lo único que se guardaba antes.
    const intervencionesDeUsuario = transcriptions.filter(
      (t) => t.role !== "assistant"
    ).length;

    const analyses: Doc<"ai_analysis">[] = [];
    for (const t of transcriptions) {
      const a = await ctx.db
        .query("ai_analysis")
        .withIndex("by_transcription", (q) => q.eq("transcriptionId", t._id))
        .collect();
      analyses.push(...a);
    }

    // Agrupar por usuario. El Map mantiene el Id<"usuario"> como clave tipada;
    // un objeto plano lo degradaría a string y obligaría a castear al insertar.
    const byUser = new Map<
      Id<"usuario">,
      {
        responses: string[];
        qualities: number[];
        concepts: string[];
        missed: string[];
      }
    >();

    for (const a of analyses) {
      const entry = byUser.get(a.userId) ?? {
        responses: [],
        qualities: [],
        concepts: [],
        missed: [],
      };
      entry.responses.push(a.response_text);
      entry.qualities.push(a.quality);
      entry.concepts.push(...a.concepts);
      // Un análisis con understanding=false marca los conceptos que el
      // estudiante tocó sin llegar a comprender: eso es lo que hay que reforzar.
      if (!a.understanding) {
        entry.missed.push(...a.concepts);
      }
      byUser.set(a.userId, entry);
    }

    for (const [userId, data] of byUser) {
      const avgQuality =
        data.qualities.length > 0
          ? data.qualities.reduce((a, b) => a + b, 0) / data.qualities.length
          : 0;

      const uniqueConcepts = [...new Set(data.concepts)];
      const missedConcepts = [...new Set(data.missed)];

      await ctx.db.insert("session_reports", {
        sessionId: vapiSession.sessionId,
        userId,
        totalParticipation:
          intervencionesDeUsuario > 0
            ? (data.responses.length / intervencionesDeUsuario) * 100
            : 0,
        avgQuality: Math.round(avgQuality * 10) / 10,
        conceptsMastered: uniqueConcepts
          .filter((c) => !missedConcepts.includes(c))
          .slice(0, 3),
        conceptsMissed: missedConcepts,
        summaryText: `Participación: ${data.responses.length} respuestas. Calidad promedio: ${avgQuality.toFixed(1)}/10. Conceptos: ${uniqueConcepts.join(", ")}`,
        recommendations: [
          avgQuality < 5
            ? "Necesita más práctica en conceptos fundamentales"
            : "Buen desempeño",
        ],
        generatedAt: Date.now(),
      });
    }
  },
});

export const getSessionReport = query({
  args: {
    sessionId: v.id("study_sessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("session_reports")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

/**
 * Retraso entre el fin de la llamada y la generación del reporte.
 *
 * Al cortar la sesión todavía quedan análisis de las últimas frases corriendo
 * contra la API de Claude. Generar el reporte en ese momento lo dejaría sin
 * las respuestas finales, y como generateSessionReport no se repite, ese
 * reporte incompleto sería el definitivo.
 */
const REPORT_DELAY_MS = 20_000;

/**
 * Agenda el reporte de la sesión.
 *
 * Todos los caminos de cierre —el botón de la interfaz, el status-update de
 * Vapi y el end-of-call-report— pasan por acá, para que el reporte se arme
 * siempre con el mismo margen y una sola vez.
 */
export const scheduleSessionReport = mutation({
  args: {
    vapiCallId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(
      REPORT_DELAY_MS,
      api.functions.reports.generateSessionReport,
      { vapiCallId: args.vapiCallId }
    );
  },
});
