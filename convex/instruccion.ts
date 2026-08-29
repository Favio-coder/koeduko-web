import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const crear = mutation({
  args: {
    nombre: v.string(),
    desc: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("instruccion", {
      ...args,
      crea: Date.now(),
    });
  },
});

export const obtener = query({
  args: { id: v.id("instruccion") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listar = query({
  handler: async (ctx) => {
    return await ctx.db.query("instruccion").collect();
  },
});
