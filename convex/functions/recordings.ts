import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * URL de subida de un solo uso.
 *
 * El archivo va directo del navegador al storage de Convex sin pasar por una
 * mutation: el audio de una clase pesa demasiado para viajar como argumento.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Registra una grabación ya subida al storage.
 *
 * Se llama después de que el navegador subió el archivo y recibió su
 * storageId.
 */
export const saveRecording = mutation({
  args: {
    autorEmail: v.string(),
    storageId: v.id("_storage"),
    duracionSegundos: v.number(),
    titulo: v.optional(v.string()),
    sessionId: v.optional(v.id("study_sessions")),
  },
  handler: async (ctx, args) => {
    const autor = await ctx.db
      .query("usuario")
      .withIndex("por_email", (q) => q.eq("email", args.autorEmail))
      .first();

    if (!autor) {
      // El archivo ya está subido: si no se puede registrar, se borra para no
      // dejar audio huérfano ocupando storage sin ninguna fila que lo apunte.
      await ctx.storage.delete(args.storageId);
      throw new Error(`No existe un usuario con el email ${args.autorEmail}`);
    }

    return await ctx.db.insert("classroom_recordings", {
      autorId: autor._id,
      storageId: args.storageId,
      duracionSegundos: args.duracionSegundos,
      titulo: args.titulo,
      sessionId: args.sessionId,
      estado: "guardada",
      createdAt: Date.now(),
    });
  },
});

/**
 * Grabaciones del docente, de la más reciente a la más vieja.
 *
 * Devuelve la URL de reproducción resuelta: el storageId por sí solo no sirve
 * para un <audio src>.
 */
export const listRecordings = query({
  args: {
    autorEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const autor = await ctx.db
      .query("usuario")
      .withIndex("por_email", (q) => q.eq("email", args.autorEmail))
      .first();

    if (!autor) return [];

    const grabaciones = await ctx.db
      .query("classroom_recordings")
      .withIndex("by_autor", (q) => q.eq("autorId", autor._id))
      .collect();

    const ordenadas = grabaciones.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      ordenadas.map(async (grabacion) => ({
        id: grabacion._id,
        titulo: grabacion.titulo,
        duracionSegundos: grabacion.duracionSegundos,
        estado: grabacion.estado,
        transcripcion: grabacion.transcripcion,
        createdAt: grabacion.createdAt,
        url: await ctx.storage.getUrl(grabacion.storageId),
      }))
    );
  },
});

export const deleteRecording = mutation({
  args: {
    recordingId: v.id("classroom_recordings"),
    autorEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const grabacion = await ctx.db.get(args.recordingId);
    if (!grabacion) return;

    const autor = await ctx.db
      .query("usuario")
      .withIndex("por_email", (q) => q.eq("email", args.autorEmail))
      .first();

    if (!autor || grabacion.autorId !== autor._id) {
      throw new Error("No podés borrar una grabación de otro docente");
    }

    // Primero el archivo y después la fila: al revés, un fallo en el medio
    // dejaría el audio en el storage sin nada que lo referencie.
    await ctx.storage.delete(grabacion.storageId);
    await ctx.db.delete(args.recordingId);
  },
});
