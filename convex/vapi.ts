import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── CREAR sesión de voz ───
export const createSession = mutation({
  args: {
    vapiCallId: v.string(),
    sessionId: v.id("study_sessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("vapi_sessions", {
      ...args,
      status: "active",
      startedAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

// ─── ACTUALIZAR estado de sesión ───
export const updateSessionStatus = mutation({
  args: {
    vapiCallId: v.string(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("vapi_sessions")
      .withIndex("by_call", (q) => q.eq("vapiCallId", args.vapiCallId))
      .first();
    if (!session) return null;

    const updates: Record<string, unknown> = { status: args.status };
    if (args.status === "completed" || args.status === "failed") {
      updates.endedAt = Date.now();
    }
    await ctx.db.patch(session._id, updates);
    return session._id;
  },
});

// ─── OBTENER sesión por Vapi Call ID ───
export const getByVapiCallId = query({
  args: { vapiCallId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vapi_sessions")
      .withIndex("by_call", (q) => q.eq("vapiCallId", args.vapiCallId))
      .first();
  },
});

// (Faltaría implementar las funciones CRUD para transcriptions, ai_analysis, y session_reports, pero con esto corregimos los errores de compilación por el cambio de esquema)
