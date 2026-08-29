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

/**
 * Qué conviene reforzar en la próxima clase, según las sesiones ya analizadas.
 *
 * Cierra el circuito escuchar → analizar → planificar: el docente no tiene que
 * releer los reportes uno por uno para saber por dónde empezar.
 */
export const sugerenciasParaPlan = query({
  args: {},
  handler: async (ctx) => {
    const docente = await perfilAutenticado(ctx);
    if (!docente) return null;

    // Se miran los reportes recientes de toda la plataforma, no solo los de
    // este docente: los reportes se guardan por estudiante, no por autor.
    const reportes = await ctx.db.query("session_reports").take(200);

    if (reportes.length === 0) {
      return { conceptos: [], estudiantesEnRefuerzo: [], sesionesAnalizadas: 0 };
    }

    // Cuántos estudiantes distintos arrastran cada concepto: un tema que
    // aparece en varios pesa más que uno que le costó a una sola persona.
    const porConcepto = new Map<string, Set<string>>();
    const estudiantesEnRefuerzo: { nombre: string; avgQuality: number }[] = [];

    // Los reportes generados antes de excluir a los docentes siguen en la base.
    // Se filtra por rol acá también para que un reporte viejo del profesor no
    // ensucie las sugerencias.
    const rolPorUsuario = new Map<string, string | null>();
    const esDocente = async (userId: (typeof reportes)[number]["userId"]) => {
      if (!rolPorUsuario.has(userId)) {
        const usuario = await ctx.db.get(userId);
        const rol = usuario ? await ctx.db.get(usuario.rol_id) : null;
        rolPorUsuario.set(userId, rol?.nombre ?? null);
      }
      return rolPorUsuario.get(userId) === "docente";
    };

    for (const reporte of reportes) {
      if (await esDocente(reporte.userId)) continue;

      for (const concepto of reporte.conceptsMissed) {
        const clave = concepto.trim().toLowerCase();
        if (!clave) continue;
        const conjunto = porConcepto.get(clave) ?? new Set<string>();
        conjunto.add(reporte.userId);
        porConcepto.set(clave, conjunto);
      }

      if (reporte.avgQuality > 0 && reporte.avgQuality < 5) {
        const usuario = await ctx.db.get(reporte.userId);
        if (usuario) {
          estudiantesEnRefuerzo.push({
            nombre: usuario.nombre,
            avgQuality: reporte.avgQuality,
          });
        }
      }
    }

    const conceptos = [...porConcepto.entries()]
      .map(([concepto, estudiantes]) => ({
        concepto,
        estudiantes: estudiantes.size,
      }))
      .sort((a, b) => b.estudiantes - a.estudiantes)
      .slice(0, 6);

    const sesiones = new Set(reportes.map((r) => r.sessionId));

    return {
      conceptos,
      estudiantesEnRefuerzo: estudiantesEnRefuerzo
        .sort((a, b) => a.avgQuality - b.avgQuality)
        .slice(0, 5),
      sesionesAnalizadas: sesiones.size,
    };
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
