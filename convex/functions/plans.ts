import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { perfilAutenticado, requerirPerfil } from "../lib/perfil";

/**
 * Campos que el docente completa en el formulario.
 *
 * Se declaran una sola vez y se reutilizan, para que agregar un campo al plan
 * no obligue a tocar dos listas que después se desincronizan.
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
 * El autor sale de la sesión, no de un argumento: antes el email llegaba desde
 * el cliente y bastaba con cambiarlo para escribir en nombre de otro docente.
 */
export const savePlan = mutation({
  args: {
    planId: v.optional(v.id("session_plans")),
    ...planFields,
  },
  handler: async (ctx, args) => {
    const { planId, ...campos } = args;
    const autor = await requerirPerfil(ctx);

    if (planId) {
      const existente = await ctx.db.get(planId);
      if (!existente) {
        throw new Error(`El plan ${planId} no existe`);
      }
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
 * Planes del docente autenticado, del más reciente al más viejo.
 */
export const listPlansByAuthor = query({
  args: {},
  handler: async (ctx) => {
    const autor = await perfilAutenticado(ctx);
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
    const autor = await perfilAutenticado(ctx);
    if (!autor) return null;

    const plan = await ctx.db.get(args.planId);
    // Un plan ajeno se trata como inexistente: responder "no autorizado"
    // confirmaría que ese id existe.
    if (!plan || plan.autorId !== autor._id) return null;

    return plan;
  },
});

export const deletePlan = mutation({
  args: {
    planId: v.id("session_plans"),
  },
  handler: async (ctx, args) => {
    const autor = await requerirPerfil(ctx);

    const plan = await ctx.db.get(args.planId);
    if (!plan) return;

    if (plan.autorId !== autor._id) {
      throw new Error("No podés borrar un plan de otro docente");
    }

    await ctx.db.delete(args.planId);
  },
});
