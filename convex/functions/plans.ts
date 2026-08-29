import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Campos que el docente completa en el formulario.
 *
 * Se declaran una sola vez y se reutilizan en crear y actualizar, para que
 * agregar un campo al plan no obligue a tocar dos listas que después se
 * desincronizan.
 */
const planFields = {
  titulo: v.string(),
  curso: v.string(),
  grado: v.string(),
  duracion: v.string(),
  fecha: v.string(),
  proposito: v.string(),
  inicioActividades: v.string(),
  desarrolloActividades: v.string(),
  cierreActividades: v.string(),
  evaluacionEstrategia: v.string(),
  materialesRequeridos: v.string(),
};

/**
 * Guarda un plan nuevo o actualiza uno existente.
 *
 * El id opcional evita que editar un plan y volver a guardarlo cree un
 * duplicado cada vez.
 */
export const savePlan = mutation({
  args: {
    planId: v.optional(v.id("session_plans")),
    autorEmail: v.string(),
    ...planFields,
  },
  handler: async (ctx, args) => {
    const { planId, autorEmail, ...campos } = args;

    const autor = await ctx.db
      .query("usuario")
      .withIndex("por_email", (q) => q.eq("email", autorEmail))
      .first();

    if (!autor) {
      throw new Error(`No existe un usuario con el email ${autorEmail}`);
    }

    if (planId) {
      const existente = await ctx.db.get(planId);
      if (!existente) {
        throw new Error(`El plan ${planId} no existe`);
      }
      // Un plan solo lo edita quien lo escribió: sin esta comprobación
      // cualquier docente podría sobrescribir la planificación de otro.
      if (existente.autorId !== autor._id) {
        throw new Error("No podés editar un plan de otro docente");
      }

      await ctx.db.patch(planId, { ...campos, updatedAt: Date.now() });
      return planId;
    }

    return await ctx.db.insert("session_plans", {
      autorId: autor._id,
      ...campos,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Planes del docente, del más reciente al más viejo.
 */
export const listPlansByAuthor = query({
  args: {
    autorEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const autor = await ctx.db
      .query("usuario")
      .withIndex("por_email", (q) => q.eq("email", args.autorEmail))
      .first();

    if (!autor) return [];

    const planes = await ctx.db
      .query("session_plans")
      .withIndex("by_autor", (q) => q.eq("autorId", autor._id))
      .collect();

    return planes.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getPlan = query({
  args: {
    planId: v.id("session_plans"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.planId);
  },
});

export const deletePlan = mutation({
  args: {
    planId: v.id("session_plans"),
    autorEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan) return;

    const autor = await ctx.db
      .query("usuario")
      .withIndex("por_email", (q) => q.eq("email", args.autorEmail))
      .first();

    if (!autor || plan.autorId !== autor._id) {
      throw new Error("No podés borrar un plan de otro docente");
    }

    await ctx.db.delete(args.planId);
  },
});
