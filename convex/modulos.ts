import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const crear = mutation({
  args: {
    nombre: v.string(),
    desc: v.string(),
    orden: v.number(),
    c_curso: v.id("curso"),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("modulos", {
      ...args,
      crea: Date.now(),
    });
  },
});

export const obtener = query({
  args: { id: v.id("modulos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listarPorCurso = query({
  args: { c_curso: v.id("curso") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("modulos")
      .withIndex("por_c_curso", (q) => q.eq("c_curso", args.c_curso))
      .collect();
  },
});

export const listar = query({
  handler: async (ctx) => {
    return await ctx.db.query("modulos").collect();
  },
});
