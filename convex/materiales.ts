import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const crear = mutation({
  args: {
    email: v.string(),
    desc: v.string(),
    url: v.string(),
    c_mod: v.id("modulos"),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("materiales", {
      ...args,
      crea: Date.now(),
    });
  },
});

export const obtener = query({
  args: { id: v.id("materiales") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listar = query({
  handler: async (ctx) => {
    return await ctx.db.query("materiales").collect();
  },
});
