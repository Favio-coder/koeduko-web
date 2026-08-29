import { query } from "../_generated/server";

/**
 * Desempeño de cada estudiante, calculado a partir de sus session_reports.
 *
 * Un estudiante sin reportes devuelve `avgQuality: null` en lugar de un número
 * por defecto: asumir un valor falsearía la agrupación y haría pasar por dato
 * medido algo que nadie midió.
 */
export const listStudentPerformance = query({
  args: {},
  handler: async (ctx) => {
    const rolEstudiante = await ctx.db
      .query("roles")
      .withIndex("por_nombre", (q) => q.eq("nombre", "estudiante"))
      .first();

    if (!rolEstudiante) return [];

    const estudiantes = await ctx.db
      .query("usuario")
      .withIndex("por_rol_id", (q) => q.eq("rol_id", rolEstudiante._id))
      .collect();

    return await Promise.all(
      estudiantes.map(async (estudiante) => {
        const reportes = await ctx.db
          .query("session_reports")
          .withIndex("by_user", (q) => q.eq("userId", estudiante._id))
          .collect();

        if (reportes.length === 0) {
          return {
            id: estudiante._id,
            nombre: estudiante.nombre,
            carrera: estudiante.carrera,
            avgQuality: null,
            participacion: null,
            conceptosFlojos: [] as string[],
            sesionesEvaluadas: 0,
          };
        }

        const avgQuality =
          reportes.reduce((sum, r) => sum + r.avgQuality, 0) / reportes.length;
        const participacion =
          reportes.reduce((sum, r) => sum + r.totalParticipation, 0) /
          reportes.length;
        const conceptosFlojos = [
          ...new Set(reportes.flatMap((r) => r.conceptsMissed)),
        ];

        return {
          id: estudiante._id,
          nombre: estudiante.nombre,
          carrera: estudiante.carrera,
          avgQuality: Math.round(avgQuality * 10) / 10,
          participacion: Math.round(participacion),
          conceptosFlojos,
          sesionesEvaluadas: reportes.length,
        };
      })
    );
  },
});
