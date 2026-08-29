import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// CREAR ROL
export const crear = mutation({
  args: {
    nombre: v.string(),
    desc: v.string(),
    permisos: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("roles", {
      ...args,
      crea: Date.now(),
    });
  },
});

// OBTENER ROL POR ID
export const obtener = query({
  args: { id: v.id("roles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// LISTAR TODOS LOS ROLES
export const listar = query({
  handler: async (ctx) => {
    return await ctx.db.query("roles").collect();
  },
});

// GET (ALIAS DE LISTAR PARA DASHBOARD)
export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("roles").collect();
  },
});
