import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const createTranscription = mutation({
  args: {
    vapiCallId: v.string(),
    rawText: v.string(),
  },
  handler: async (ctx, args) => {
    // Encontrar vapi_session por callId
    const vapiSession = await ctx.db
      .query("vapi_sessions")
      .filter((q) => q.eq(q.field("vapiCallId"), args.vapiCallId))
      .first();

    if (!vapiSession) {
      throw new Error(`Vapi session not found for call ${args.vapiCallId}`);
    }

    // Por ahora, asumir userId viene en metadata de Vapi
    // En versión 2.0, extraer de Vapi data
    const userId = "placeholder-user-id"; // TODO: obtener de Vapi

    const transcription = await ctx.db.insert("transcriptions", {
      vapiSessionId: vapiSession._id,
      userId: userId as any, // Casting temporal
      rawText: args.rawText,
      timestamp: Date.now(),
      createdAt: Date.now(),
    });

    return transcription;
  },
});

export const getSessionTranscriptions = query({
  args: {
    vapiSessionId: v.id("vapi_sessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transcriptions")
      .filter((q) => q.eq(q.field("vapiSessionId"), args.vapiSessionId))
      .collect();
  },
});
