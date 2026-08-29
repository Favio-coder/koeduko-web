import { mutation } from "./_generated/server";

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const docenteRoleId = await ctx.db.insert("roles", {
      nombre: "docente",
      desc: "Profesor o instructor que imparte cursos",
      crea: Date.now(),
    });

    const estudianteRoleId = await ctx.db.insert("roles", {
      nombre: "estudiante",
      desc: "Alumno que participa en cursos",
      crea: Date.now(),
    });

    const universitarioId = await ctx.db.insert("instruccion", {
      nombre: "Universitario",
      desc: "Nivel educativo universitario",
      crea: Date.now(),
    });

    await ctx.db.insert("usuario", {
      nombre: "Profesor Ana",
      genero: "femenino",
      email: "ana@koeduko.com",
      carrera: "Educación",
      rol_id: docenteRoleId,
      es_st: universitarioId,
      crea: Date.now(),
    });

    await Promise.all([
      ctx.db.insert("usuario", {
        nombre: "Estudiante Carlos",
        genero: "masculino",
        email: "carlos@koeduko.com",
        carrera: "Ingeniería",
        rol_id: estudianteRoleId,
        es_st: universitarioId,
        crea: Date.now(),
      }),
      ctx.db.insert("usuario", {
        nombre: "Estudiante Lucía",
        genero: "femenino",
        email: "lucia@koeduko.com",
        carrera: "Diseño",
        rol_id: estudianteRoleId,
        es_st: universitarioId,
        crea: Date.now(),
      }),
      ctx.db.insert("usuario", {
        nombre: "Estudiante Miguel",
        genero: "masculino",
        email: "miguel@koeduko.com",
        carrera: "Programación",
        rol_id: estudianteRoleId,
        es_st: universitarioId,
        crea: Date.now(),
      }),
      ctx.db.insert("usuario", {
        nombre: "Estudiante Sofía",
        genero: "femenino",
        email: "sofia@koeduko.com",
        carrera: "Matemáticas",
        rol_id: estudianteRoleId,
        es_st: universitarioId,
        crea: Date.now(),
      }),
    ]);

    const cursoId = await ctx.db.insert("curso", {
      nombre: "Introducción a la Programación",
      desc: "Curso básico de programación para principiantes",
      c_grado: universitarioId,
      crea: Date.now(),
    });

    await ctx.db.insert("modulos", {
      nombre: "Fundamentos de Programación",
      desc: "Primer módulo del curso",
      orden: 1,
      c_curso: cursoId,
      crea: Date.now(),
    });

    console.log("Seed completado: 1 docente, 4 estudiantes, 1 curso, 1 módulo creados");
  },
});