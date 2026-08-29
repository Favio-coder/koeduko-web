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

/**
 * Parejas sugeridas para aprendizaje entre pares.
 *
 * Empareja al de mayor desempeño con el de menor, al segundo con el anteúltimo
 * y así: el que más domina acompaña al que más lo necesita, en vez de juntar a
 * los que ya entienden entre sí.
 *
 * El tema de cada pareja sale de lo que el aprendiz tiene pendiente y el mentor
 * ya domina — si no hay coincidencia, la pareja igual sirve pero sin tema
 * sugerido, y eso se dice en vez de inventar uno.
 */
export const sugerirParejas = query({
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

    const conDesempeno = [];
    for (const estudiante of estudiantes) {
      const reportes = await ctx.db
        .query("session_reports")
        .withIndex("by_user", (q) => q.eq("userId", estudiante._id))
        .collect();

      // Sin reportes no se puede emparejar por desempeño: no se sabe quién
      // acompañaría a quién.
      if (reportes.length === 0) continue;

      conDesempeno.push({
        id: estudiante._id,
        nombre: estudiante.nombre,
        avgQuality:
          Math.round(
            (reportes.reduce((s, r) => s + r.avgQuality, 0) / reportes.length) * 10
          ) / 10,
        domina: [...new Set(reportes.flatMap((r) => r.conceptsMastered))],
        pendientes: [...new Set(reportes.flatMap((r) => r.conceptsMissed))],
      });
    }

    const ordenados = conDesempeno.sort((a, b) => b.avgQuality - a.avgQuality);

    const parejas = [];
    let inicio = 0;
    let fin = ordenados.length - 1;

    while (inicio < fin) {
      const mentor = ordenados[inicio];
      const aprendiz = ordenados[fin];

      const temaComun = aprendiz.pendientes.find((p) =>
        mentor.domina.some((d) => d.toLowerCase() === p.toLowerCase())
      );

      parejas.push({
        mentor: { id: mentor.id, nombre: mentor.nombre, avgQuality: mentor.avgQuality },
        aprendiz: {
          id: aprendiz.id,
          nombre: aprendiz.nombre,
          avgQuality: aprendiz.avgQuality,
        },
        tema: temaComun ?? aprendiz.pendientes[0] ?? null,
        temaLoDominaElMentor: Boolean(temaComun),
      });

      inicio += 1;
      fin -= 1;
    }

    return parejas;
  },
});
