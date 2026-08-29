import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { api } from "../_generated/api";

const roleValidator = v.union(v.literal("user"), v.literal("assistant"));

/**
 * Construye la clave de idempotencia de una frase.
 *
 * El navegador y el webhook transcriben la misma llamada al mismo tiempo, así
 * que cada frase llega dos veces. La clave usa el segundo en que arranca la
 * frase, que es el único dato estable entre ambos caminos: el texto puede
 * repetirse legítimamente ("sí", "claro") y el timestamp de llegada difiere
 * según la latencia de cada vía.
 *
 * Cuando Vapi no manda secondsFromStart se cae al texto normalizado. Es peor
 * —colapsa repeticiones reales— pero prefiere perder una frase repetida antes
 * que duplicar la sesión entera.
 */
const buildDedupeKey = (
  vapiCallId: string,
  role: "user" | "assistant",
  text: string,
  secondsFromStart?: number
) => {
  if (secondsFromStart !== undefined) {
    // Décimas de segundo: las dos vías reportan el mismo arranque con
    // diferencias de milisegundos.
    return `${vapiCallId}|${role}|${Math.round(secondsFromStart * 10)}`;
  }
  return `${vapiCallId}|${role}|${text.trim().toLowerCase()}`;
};

/**
 * Guarda una frase de la conversación, venga del navegador o del webhook.
 *
 * Es idempotente: si la misma frase ya entró por el otro camino, devuelve la
 * transcripción existente en lugar de insertar un duplicado.
 */
export const ingestTranscript = mutation({
  args: {
    vapiCallId: v.string(),
    role: roleValidator,
    text: v.string(),
    secondsFromStart: v.optional(v.number()),
    source: v.union(v.literal("client"), v.literal("webhook")),
    userId: v.optional(v.id("usuario")),
  },
  handler: async (ctx, args) => {
    const text = args.text.trim();

    // Vapi emite finales vacíos cuando el hablante corta a mitad de palabra.
    if (text.length === 0) {
      return { transcriptionId: null, created: false };
    }

    const vapiSession = await ctx.db
      .query("vapi_sessions")
      .withIndex("by_call", (q) => q.eq("vapiCallId", args.vapiCallId))
      .first();

    // Sin sesión no hay a qué colgar la frase. No se lanza: el webhook puede
    // llegar antes de que el frontend haya registrado el callId real, y hacer
    // fallar el handler haría que Vapi reintentara toda la llamada.
    if (!vapiSession) {
      console.warn(`Sin vapi_session para la llamada ${args.vapiCallId}`);
      return { transcriptionId: null, created: false };
    }

    const dedupeKey = buildDedupeKey(
      args.vapiCallId,
      args.role,
      text,
      args.secondsFromStart
    );

    const existente = await ctx.db
      .query("transcriptions")
      .withIndex("by_dedupe", (q) => q.eq("dedupeKey", dedupeKey))
      .first();

    if (existente) {
      return { transcriptionId: existente._id, created: false };
    }

    // El userId se resuelve contra la cadena real de la sesión en lugar de
    // inventarse: transcriptions.userId es un v.id("usuario") y un string
    // arbitrario hace fallar cualquier query que lo use.
    let userId: Id<"usuario"> | undefined = args.userId;

    if (!userId) {
      const studySession = await ctx.db.get(vapiSession.sessionId);
      if (!studySession) {
        throw new Error(
          `La sesión de estudio ${vapiSession.sessionId} no existe`
        );
      }

      const connection = await ctx.db.get(studySession.connectionId);
      if (!connection) {
        throw new Error(`La conexión ${studySession.connectionId} no existe`);
      }

      userId = connection.userId_from;
    }

    const transcriptionId = await ctx.db.insert("transcriptions", {
      vapiSessionId: vapiSession._id,
      userId,
      rawText: text,
      role: args.role,
      secondsFromStart: args.secondsFromStart,
      dedupeKey,
      source: args.source,
      timestamp: Date.now(),
      createdAt: Date.now(),
    });

    // El análisis se agenda desde acá, dentro de la misma transacción que hizo
    // el insert. Así corre exactamente una vez por frase, sin importar si la
    // frase entró por el navegador o por el webhook: la que llega segunda ya
    // salió por la rama de deduplicación y nunca llega hasta este punto.
    //
    // Solo se analiza al estudiante. Las intervenciones del asistente se
    // transcriben igual, pero evaluarlas no aporta al reporte y duplica el
    // gasto en la API de Claude.
    if (args.role === "user") {
      await ctx.scheduler.runAfter(
        0,
        api.functions.analysis_node.analyzeTranscription,
        { transcriptionId, text }
      );
    }

    return { transcriptionId, created: true };
  },
});

/**
 * Alta directa de una transcripción, sin deduplicación.
 *
 * Se mantiene para altas manuales y seeds. El camino de la sesión en vivo usa
 * ingestTranscript, que es el que sabe convivir con las dos vías de captura.
 */
export const createTranscription = mutation({
  args: {
    vapiCallId: v.string(),
    rawText: v.string(),
    userId: v.optional(v.id("usuario")),
  },
  handler: async (ctx, args) => {
    const vapiSession = await ctx.db
      .query("vapi_sessions")
      .withIndex("by_call", (q) => q.eq("vapiCallId", args.vapiCallId))
      .first();

    if (!vapiSession) {
      throw new Error(`Vapi session not found for call ${args.vapiCallId}`);
    }

    let userId = args.userId;

    if (!userId) {
      const studySession = await ctx.db.get(vapiSession.sessionId);
      if (!studySession) {
        throw new Error(
          `La sesión de estudio ${vapiSession.sessionId} no existe`
        );
      }

      const connection = await ctx.db.get(studySession.connectionId);
      if (!connection) {
        throw new Error(`La conexión ${studySession.connectionId} no existe`);
      }

      userId = connection.userId_from;
    }

    return await ctx.db.insert("transcriptions", {
      vapiSessionId: vapiSession._id,
      userId,
      rawText: args.rawText,
      timestamp: Date.now(),
      createdAt: Date.now(),
    });
  },
});

/**
 * Transcripciones de la sesión en orden de conversación.
 *
 * Ordena por secondsFromStart y no por createdAt: las frases entran por dos
 * vías con latencias distintas, así que el orden de llegada no es el orden en
 * que se dijeron. Las filas antiguas sin ese campo caen al final del bloque
 * por su timestamp.
 */
export const getSessionTranscriptions = query({
  args: {
    vapiSessionId: v.id("vapi_sessions"),
  },
  handler: async (ctx, args) => {
    const transcriptions = await ctx.db
      .query("transcriptions")
      .withIndex("by_session", (q) => q.eq("vapiSessionId", args.vapiSessionId))
      .collect();

    return transcriptions.sort((a, b) => {
      if (a.secondsFromStart !== undefined && b.secondsFromStart !== undefined) {
        return a.secondsFromStart - b.secondsFromStart;
      }
      return a.timestamp - b.timestamp;
    });
  },
});
