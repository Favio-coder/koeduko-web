import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const crear = mutation({
  args: {
    c_curso: v.id("curso"),
    c_usuario: v.id("usuario"),
    nombre: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("matricula", {
      ...args,
      crea: Date.now(),
    });
  },
});

export const obtener = query({
  args: { id: v.id("matricula") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listar = query({
  handler: async (ctx) => {
    return await ctx.db.query("matricula").collect();
  },
});

/**
 * Matrículas de un curso, con los datos del estudiante ya resueltos.
 *
 * La pantalla necesita el nombre y el email, no el id: sin esto tendría que
 * pedir cada usuario por separado desde el cliente.
 */
export const listarPorCurso = query({
  args: { c_curso: v.id("curso") },
  handler: async (ctx, args) => {
    const matriculas = await ctx.db
      .query("matricula")
      .withIndex("por_c_curso", (q) => q.eq("c_curso", args.c_curso))
      .collect();

    return await Promise.all(
      matriculas.map(async (m) => {
        const usuario = await ctx.db.get(m.c_usuario);
        return {
          id: m._id,
          nombre: m.nombre,
          crea: m.crea,
          estudiante: usuario
            ? { id: usuario._id, nombre: usuario.nombre, email: usuario.email }
            : null,
        };
      })
    );
  },
});

export const eliminar = mutation({
  args: { id: v.id("matricula") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
