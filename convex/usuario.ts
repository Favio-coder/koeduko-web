import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const crear = mutation({
  args: {
    nombre: v.string(),
    genero: v.string(),
    email: v.string(),
    carrera: v.string(),
    rol_id: v.id("roles"),
    es_st: v.optional(v.id("instruccion")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("usuario", {
      ...args,
      crea: Date.now(),
    });
  },
});

export const obtener = query({
  args: { id: v.id("usuario") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const obtenerPorEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("usuario")
      .withIndex("por_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const listar = query({
  handler: async (ctx) => {
    return await ctx.db.query("usuario").collect();
  },
});

export const actualizar = mutation({
  args: {
    id: v.id("usuario"),
    nombre: v.optional(v.string()),
    genero: v.optional(v.string()),
    carrera: v.optional(v.string()),
    rol_id: v.optional(v.id("roles")),
    es_st: v.optional(v.id("instruccion")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const campos = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, campos);
  },
});
