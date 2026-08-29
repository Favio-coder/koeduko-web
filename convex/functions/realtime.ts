import { query } from "../_generated/server";
import { v } from "convex/values";

export const subscribeToSession = query({
  args: {
    vapiSessionId: v.union(v.id("vapi_sessions"), v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const transcriptions = await ctx.db
        .query("transcriptions")
        .withIndex("by_session", (q) => q.eq("vapiSessionId", args.vapiSessionId as any))
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
    } catch {
      return [];
    }
  },
});

export const subscribeToSessionReports = query({
  args: {
    sessionId: v.union(v.id("study_sessions"), v.string()),
  },
  handler: async (ctx, args) => {
    try {
      return await ctx.db
        .query("session_reports")
        .filter((q) => q.eq(q.field("sessionId"), args.sessionId as any))
        .collect();
    } catch {
      return [];
    }
  },
});
