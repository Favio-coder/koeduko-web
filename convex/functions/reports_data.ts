import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Datos de soporte para los reportes con IA.
 *
 * Van en un archivo aparte de reports_ai.ts porque aquel lleva "use node" para
 * el SDK de Anthropic, y Convex no admite queries ni mutations en esos
 * archivos.
 */

/**
 * Conversación de la sesión, agrupada por estudiante.
 *
 * Devuelve la conversación completa —incluidas las intervenciones del
 * asistente— además de las de cada estudiante por separado: una respuesta
 * suelta no se puede interpretar sin la pregunta que la provocó.
 */
export const conversacionPorEstudiante = internalQuery({
  args: {
    vapiCallId: v.string(),
  },
  handler: async (ctx, args) => {
    const vapiSession = await ctx.db
      .query("vapi_sessions")
      .withIndex("by_call", (q) => q.eq("vapiCallId", args.vapiCallId))
      .first();

    if (!vapiSession) return null;

    const transcripciones = await ctx.db
      .query("transcriptions")
      .withIndex("by_session", (q) => q.eq("vapiSessionId", vapiSession._id))
      .collect();

    if (transcripciones.length === 0) return null;

    // El orden de la conversación sale de secondsFromStart, no de createdAt:
    // las frases entran por dos vías con latencias distintas.
    const ordenadas = [...transcripciones].sort((a, b) => {
      if (a.secondsFromStart !== undefined && b.secondsFromStart !== undefined) {
        return a.secondsFromStart - b.secondsFromStart;
      }
      return a.timestamp - b.timestamp;
    });

    const nombrePorUsuario = new Map<Id<"usuario">, string>();
    for (const t of ordenadas) {
      if (!nombrePorUsuario.has(t.userId)) {
        const usuario = await ctx.db.get(t.userId);
        nombrePorUsuario.set(t.userId, usuario?.nombre ?? "Estudiante");
      }
    }

    const conversacion = ordenadas
      .map((t) => {
        const quien =
          t.role === "assistant"
            ? "Asistente"
            : nombrePorUsuario.get(t.userId) ?? "Estudiante";
        return `${quien}: ${t.rawText}`;
      })
      .join("\n");

    // Las intervenciones del asistente no se atribuyen a nadie: el reporte es
    // sobre lo que dijeron los estudiantes.
    const deEstudiantes = ordenadas.filter((t) => t.role !== "assistant");

    const porUsuario = new Map<
      Id<"usuario">,
      { intervenciones: string[]; calidades: number[] }
    >();

    for (const t of deEstudiantes) {
      const entrada = porUsuario.get(t.userId) ?? {
        intervenciones: [],
        calidades: [],
      };
      entrada.intervenciones.push(t.rawText);

      // La calidad ya calculada por el análisis individual se reutiliza: el
      // reporte narrativo no la recalcula.
      const analisis = await ctx.db
        .query("ai_analysis")
        .withIndex("by_transcription", (q) => q.eq("transcriptionId", t._id))
        .collect();
      entrada.calidades.push(...analisis.map((a) => a.quality));

      porUsuario.set(t.userId, entrada);
    }

    const estudiantes = [...porUsuario.entries()].map(([id, datos]) => ({
      id,
      nombre: nombrePorUsuario.get(id) ?? "Estudiante",
      intervenciones: datos.intervenciones,
      participacion:
        (datos.intervenciones.length / deEstudiantes.length) * 100,
      avgQuality:
        datos.calidades.length > 0
          ? Math.round(
              (datos.calidades.reduce((a, b) => a + b, 0) /
                datos.calidades.length) *
                10
            ) / 10
          : 0,
    }));

    return {
      sessionId: vapiSession.sessionId,
      conversacion,
      estudiantes,
    };
  },
});

/**
 * Guarda el reporte escrito por Claude, reemplazando el anterior si lo hay.
 */
export const guardarReporteIA = internalMutation({
  args: {
    sessionId: v.id("study_sessions"),
    userId: v.id("usuario"),
    totalParticipation: v.number(),
    avgQuality: v.number(),
    conceptsMastered: v.array(v.string()),
    conceptsMissed: v.array(v.string()),
    summaryText: v.string(),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Un reporte por estudiante y sesión: regenerar reemplaza en vez de
    // acumular versiones que después se muestran duplicadas.
    const existente = await ctx.db
      .query("session_reports")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    const datos = {
      sessionId: args.sessionId,
      userId: args.userId,
      totalParticipation: args.totalParticipation,
      avgQuality: args.avgQuality,
      conceptsMastered: args.conceptsMastered,
      conceptsMissed: args.conceptsMissed,
      summaryText: args.summaryText,
      recommendations: args.recommendations,
      generatedAt: Date.now(),
    };

    if (existente) {
      await ctx.db.patch(existente._id, datos);
      return existente._id;
    }

    return await ctx.db.insert("session_reports", datos);
  },
});
