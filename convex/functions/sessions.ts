import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

/**
 * Crea la cadena completa que una sesión en vivo necesita:
 * peer_connections → study_sessions → vapi_sessions.
 *
 * Devuelve IDs reales de Convex. Nunca inventar strings tipo "session-123":
 * los validators v.id() los rechazan y la query falla durante el render.
 */
export const createLiveSession = mutation({
  args: {
    instructorEmail: v.string(),
    vapiCallId: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Usuario que abre la sesión
    const instructor = await ctx.db
      .query("usuario")
      .withIndex("por_email", (q) => q.eq("email", args.instructorEmail))
      .first();

    if (!instructor) {
      throw new Error(`No existe un usuario con el email ${args.instructorEmail}`);
    }

    // 2. Contraparte de la conexión.
    // study_sessions cuelga de peer_connections, que modela un vínculo entre
    // dos usuarios. Mientras la sesión en vivo no tenga participantes reales,
    // se toma el primer usuario distinto al instructor; si es el único
    // registrado, la conexión queda consigo mismo.
    const candidatos = await ctx.db.query("usuario").take(10);
    const contraparte = candidatos.find((u) => u._id !== instructor._id) ?? instructor;

    // 3. Reutiliza la conexión si ya existe, para no duplicarla en cada sesión
    const conexiones = await ctx.db
      .query("peer_connections")
      .withIndex("by_from", (q) => q.eq("userId_from", instructor._id))
      .collect();

    let connectionId = conexiones.find((c) => c.userId_to === contraparte._id)?._id;

    if (!connectionId) {
      connectionId = await ctx.db.insert("peer_connections", {
        userId_from: instructor._id,
        userId_to: contraparte._id,
        status: "accepted",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // 4. Sesión de estudio y su sesión de Vapi asociada
    const sessionId = await ctx.db.insert("study_sessions", {
      connectionId,
      title: args.title ?? "Sesión en vivo",
      status: "ongoing",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const vapiSessionId = await ctx.db.insert("vapi_sessions", {
      sessionId,
      vapiCallId: args.vapiCallId,
      status: "active",
      startedAt: Date.now(),
      createdAt: Date.now(),
    });

    return { sessionId, vapiSessionId };
  },
});

/**
 * Cierra la sesión de Vapi y marca la study_session como completada.
 */
export const endLiveSession = mutation({
  args: {
    vapiSessionId: v.id("vapi_sessions"),
  },
  handler: async (ctx, args) => {
    const vapiSession = await ctx.db.get(args.vapiSessionId);
    if (!vapiSession) return;

    await ctx.db.patch(args.vapiSessionId, {
      status: "completed",
      endedAt: Date.now(),
    });

    await ctx.db.patch(vapiSession.sessionId, {
      status: "completed",
      updatedAt: Date.now(),
    });

    await ctx.runMutation(api.functions.reports.scheduleSessionReport, {
      vapiCallId: vapiSession.vapiCallId,
    });
  },
});

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

/**
 * Reemplaza el callId provisional por el que asigna Vapi al conectar.
 *
 * La sesión se crea en Convex antes de llamar a Vapi, así que arranca con un
 * placeholder. El webhook llega identificado con el callId real de Vapi: sin
 * este patch, la búsqueda por índice by_call no encuentra la sesión y toda la
 * transcripción del servidor se descarta en silencio.
 */
export const attachVapiCallId = mutation({
  args: {
    vapiSessionId: v.id("vapi_sessions"),
    vapiCallId: v.string(),
  },
  handler: async (ctx, args) => {
    const vapiSession = await ctx.db.get(args.vapiSessionId);
    if (!vapiSession) {
      throw new Error(`No existe la vapi_session ${args.vapiSessionId}`);
    }

    if (vapiSession.vapiCallId === args.vapiCallId) return;

    await ctx.db.patch(args.vapiSessionId, { vapiCallId: args.vapiCallId });
  },
});

/**
 * Cierra la sesión desde el webhook, identificada por el callId de Vapi.
 *
 * Duplica lo que hace endLiveSession a propósito: el navegador puede cerrarse
 * a mitad de la llamada y nunca llegar a avisar, y entonces la sesión queda
 * marcada como activa para siempre.
 */
export const markCallEnded = mutation({
  args: {
    vapiCallId: v.string(),
  },
  handler: async (ctx, args) => {
    const vapiSession = await ctx.db
      .query("vapi_sessions")
      .withIndex("by_call", (q) => q.eq("vapiCallId", args.vapiCallId))
      .first();

    if (!vapiSession || vapiSession.status === "completed") return;

    await ctx.db.patch(vapiSession._id, {
      status: "completed",
      endedAt: Date.now(),
    });

    await ctx.db.patch(vapiSession.sessionId, {
      status: "completed",
      updatedAt: Date.now(),
    });

    await ctx.runMutation(api.functions.reports.scheduleSessionReport, {
      vapiCallId: args.vapiCallId,
    });
  },
});
