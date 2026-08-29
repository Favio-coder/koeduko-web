import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Query y mutation que dan soporte al análisis con Claude.
 *
 * La action que llama a la API vive en analysis_node.ts, porque el SDK de
 * Anthropic necesita el runtime de Node y Convex no admite queries ni
 * mutations en archivos con "use node".
 */

/**
 * Última transcripción de la sesión de Vapi identificada por su callId.
 */
export const latestTranscriptionByCall = internalQuery({
  args: {
    vapiCallId: v.string(),
  },
  handler: async (ctx, args) => {
    const vapiSession = await ctx.db
      .query("vapi_sessions")
      .withIndex("by_call", (q) => q.eq("vapiCallId", args.vapiCallId))
      .first();

    if (!vapiSession) return null;

    return await ctx.db
      .query("transcriptions")
      .withIndex("by_session", (q) => q.eq("vapiSessionId", vapiSession._id))
      .order("desc")
      .first();
  },
});

/**
 * Guarda el análisis producido por Claude.
 */
export const saveAnalysis = internalMutation({
  args: {
    transcriptionId: v.id("transcriptions"),
    userId: v.id("usuario"),
    quality: v.number(),
    understanding: v.boolean(),
    concepts: v.array(v.string()),
    sentiment: v.string(),
    responseText: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ai_analysis", {
      transcriptionId: args.transcriptionId,
      userId: args.userId,
      quality: args.quality,
      understanding: args.understanding,
      concepts: args.concepts,
      sentiment: args.sentiment,
      response_text: args.responseText,
      createdAt: Date.now(),
    });
  },
});

/**
 * Transcripción concreta que hay que analizar.
 *
 * Reemplaza a latestTranscriptionByCall en el camino en vivo: cuando dos
 * frases entran con pocos milisegundos de diferencia, "la última de la
 * llamada" no es necesariamente la que disparó el análisis, y el resultado se
 * termina colgando de la frase equivocada.
 */
export const transcriptionById = internalQuery({
  args: {
    transcriptionId: v.id("transcriptions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.transcriptionId);
  },
});
