import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { perfilAutenticado, requerirPerfil } from "../lib/perfil";

/**
 * URL de subida de un solo uso.
 *
 * Exige sesión: sin esto cualquiera podría pedir URLs y llenar el storage del
 * proyecto con archivos ajenos.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requerirPerfil(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Registra una grabación ya subida al storage.
 *
 * Se llama después de que el navegador subió el archivo y recibió su
 * storageId. El autor sale de la sesión, no de un argumento.
 */
export const saveRecording = mutation({
  args: {
    storageId: v.id("_storage"),
    duracionSegundos: v.number(),
    titulo: v.optional(v.string()),
    sessionId: v.optional(v.id("study_sessions")),
  },
  handler: async (ctx, args) => {
    let autor;
    try {
      autor = await requerirPerfil(ctx);
    } catch (error) {
      // El archivo ya está subido: si no se puede registrar, se borra para no
      // dejar audio huérfano ocupando storage sin ninguna fila que lo apunte.
      await ctx.storage.delete(args.storageId);
      throw error;
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
 * Grabaciones del docente autenticado, de la más reciente a la más vieja.
 *
 * Devuelve la URL de reproducción resuelta: el storageId por sí solo no sirve
 * para un <audio src>.
 */
export const listRecordings = query({
  args: {},
  handler: async (ctx) => {
    const autor = await perfilAutenticado(ctx);
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
  },
  handler: async (ctx, args) => {
    const autor = await requerirPerfil(ctx);

    const grabacion = await ctx.db.get(args.recordingId);
    if (!grabacion) return;

    if (grabacion.autorId !== autor._id) {
      throw new Error("No podés borrar una grabación de otro docente");
    }

    // Primero el archivo y después la fila: al revés, un fallo en el medio
    // dejaría el audio en el storage sin nada que lo referencie.
    await ctx.storage.delete(grabacion.storageId);
    await ctx.db.delete(args.recordingId);
  },
});
