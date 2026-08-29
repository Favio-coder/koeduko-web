import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const initializeVapiSession = mutation({
  args: {
    sessionId: v.id("study_sessions"),
    vapiCallId: v.string(),
  },
  handler: async (ctx, args) => {
    const vapiSession = await ctx.db.insert("vapi_sessions", {
      sessionId: args.sessionId,
      vapiCallId: args.vapiCallId,
      status: "active",
      startedAt: Date.now(),
      createdAt: Date.now(),
    });
    return vapiSession;
  },
});

export const endVapiSession = mutation({
  args: {
    vapiSessionId: v.id("vapi_sessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.vapiSessionId, {
      status: "completed",
      endedAt: Date.now(),
    });
  },
});

export const getVapiSession = query({
  args: {
    vapiSessionId: v.id("vapi_sessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.vapiSessionId);
  },
});
