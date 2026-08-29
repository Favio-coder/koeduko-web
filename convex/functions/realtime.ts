import { query } from "../_generated/server";
import { v } from "convex/values";

export const subscribeToSession = query({
  args: {
    vapiSessionId: v.id("vapi_sessions"),
  },
  handler: async (ctx, args) => {
    const transcriptions = await ctx.db
      .query("transcriptions")
      .withIndex("by_session", (q) => q.eq("vapiSessionId", args.vapiSessionId))
      .collect();
    
    if (transcriptions.length === 0) return [];

    const analyses = [];
    for (const t of transcriptions) {
      const a = await ctx.db
        .query("ai_analysis")
        .withIndex("by_transcription", (q) => q.eq("transcriptionId", t._id))
        .collect();
      analyses.push(...a);
    }
    
    analyses.sort((a, b) => b.createdAt - a.createdAt);
    return analyses;
  },
});

export const subscribeToSessionReports = query({
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
