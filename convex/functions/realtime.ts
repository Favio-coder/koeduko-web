import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

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
    return await ctx.db
      .query("session_reports")
      .withIndex("by_session", (q) =>
        q.eq("sessionId", args.sessionId as Id<"study_sessions">),
      )
      .collect();
  },
});
