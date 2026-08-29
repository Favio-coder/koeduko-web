import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const crear = mutation({
  args: {
    nombre: v.string(),
    desc: v.string(),
    c_grado: v.id("instruccion"),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("curso", {
      ...args,
      crea: Date.now(),
    });
  },
});

export const obtener = query({
  args: { id: v.id("curso") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listar = query({
  handler: async (ctx) => {
    return await ctx.db.query("curso").collect();
  },
});
