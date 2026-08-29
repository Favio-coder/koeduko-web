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
