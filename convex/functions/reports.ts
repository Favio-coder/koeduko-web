import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const generateSessionReport = mutation({
  args: {
    vapiCallId: v.string(),
  },
  handler: async (ctx, args) => {
    // Encontrar vapi_session
    const vapiSession = await ctx.db
      .query("vapi_sessions")
      .filter((q) => q.eq(q.field("vapiCallId"), args.vapiCallId))
      .first();

    if (!vapiSession) return null;

    // Obtener todos los análisis de esta sesión
    const transcriptions = await ctx.db
      .query("transcriptions")
      .filter((q) => q.eq(q.field("vapiSessionId"), vapiSession._id))
      .collect();

    if (transcriptions.length === 0) return null;

    const analyses = [];
    for (const t of transcriptions) {
      const a = await ctx.db
        .query("ai_analysis")
        .withIndex("by_transcription", (q) => q.eq("transcriptionId", t._id))
        .collect();
      analyses.push(...a);
    }

    // Agrupar por usuario
    const byUser: Record<string, any> = {};
    analyses.forEach((a) => {
      if (!byUser[a.userId]) {
        byUser[a.userId] = {
          responses: [],
          qualities: [],
          concepts: [],
        };
      }
      byUser[a.userId].responses.push(a.response_text);
      byUser[a.userId].qualities.push(a.quality);
      byUser[a.userId].concepts.push(...a.concepts);
    });

    // Crear reporte por usuario
    for (const [userId, data] of Object.entries(byUser)) {
      const avgQuality =
        data.qualities.length > 0
          ? data.qualities.reduce((a: number, b: number) => a + b) /
            data.qualities.length
          : 0;

      const uniqueConcepts = [...new Set(data.concepts)];

      await ctx.db.insert("session_reports", {
        sessionId: vapiSession.sessionId,
        userId: userId as any,
        totalParticipation: (data.responses.length / transcriptions.length) * 100,
        avgQuality: Math.round(avgQuality * 10) / 10,
        conceptsMastered: uniqueConcepts.slice(0, 3) as string[],
        conceptsMissed: [],
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
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .collect();
  },
});
