import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * KOEDUKO - Schema de Base de Datos (Tablas en Español)
 *
 * Plataforma educativa peer-to-peer.
 * "Menos escuelas, más aprendizaje"
 *
 * Este schema define las 6 tablas core en español.
 * El otro dev agregará tablas en inglés (Learning_Progress, Peer_profile, etc.)
 *
 * Convenciones:
 * - Prefijo "c_" = campo que es FK (clave foránea)
 * - "crea" = timestamp de creación (Date.now())
 * - "desc" = descripción
 * - "es_st" = estado/nivel de instrucción del usuario
 * - metadata = campo extensible para futuras propiedades
 */

export default defineSchema({
  // ─────────────────────────────────────────────
  // INSTRUCCIÓN
  // Representa roles o niveles educativos (ej: "Universitario", "Técnico", "Autodidacta").
  // Es la tabla raíz: Usuario y Curso referencian a ella.
  // ─────────────────────────────────────────────
  instruccion: defineTable({
    nombre: v.string(), // Nombre del nivel/rol (ej: "Pregrado")
    desc: v.string(), // Descripción del nivel educativo
    crea: v.number(), // Timestamp de creación (Date.now())
    metadata: v.optional(v.any()), // Campo extensible para propiedades futuras
  }).index("por_nombre", ["nombre"]),

  // ─────────────────────────────────────────────
  // USUARIO
  // Datos de los usuarios de la plataforma.
  // Pueden ser instructores o pares según el contexto.
  // "es_st" vincula al usuario con su nivel de instrucción (opcional).
  // ─────────────────────────────────────────────
  usuario: defineTable({
    nombre: v.string(), // Nombre completo del usuario
    genero: v.string(), // Género del usuario
    email: v.string(), // Email (único por usuario)
    carrera: v.string(), // Carrera o área de estudio
    es_st: v.optional(v.id("instruccion")), // FK a instruccion (opcional, puede ser null)
    crea: v.number(), // Timestamp de creación
    metadata: v.optional(v.any()), // Campo extensible
  })
    .index("por_email", ["email"])
    .index("por_es_st", ["es_st"]),

  // ─────────────────────────────────────────────
  // CURSO
  // Cursos disponibles en la plataforma.
  // Cada curso pertenece a un nivel de instrucción (c_grado).
  // ─────────────────────────────────────────────
  curso: defineTable({
    nombre: v.string(), // Nombre del curso
    desc: v.string(), // Descripción del curso
    c_grado: v.id("instruccion"), // FK a instruccion (nivel requerido)
    crea: v.number(), // Timestamp de creación
    metadata: v.optional(v.any()), // Campo extensible
  }).index("por_c_grado", ["c_grado"]),

  // ─────────────────────────────────────────────
  // MÓDULOS
  // Unidades de contenido dentro de un curso.
  // El campo "orden" permite ordenar módulos secuencialmente.
  // ─────────────────────────────────────────────
  modulos: defineTable({
    nombre: v.string(), // Nombre del módulo
    desc: v.string(), // Descripción del módulo
    orden: v.number(), // Posición dentro del curso (1, 2, 3...)
    c_curso: v.id("curso"), // FK a curso
    crea: v.number(), // Timestamp de creación
    metadata: v.optional(v.any()), // Campo extensible
  }).index("por_c_curso", ["c_curso"]),

  // ─────────────────────────────────────────────
  // MATERIALES
  // Recursos educativos subidos por usuarios.
  // Cada material pertenece a un módulo específico.
  // ─────────────────────────────────────────────
  materiales: defineTable({
    email: v.string(), // Email del usuario que sube el material
    desc: v.string(), // Descripción del material
    url: v.string(), // URL/link al recurso
    c_mod: v.id("modulos"), // FK a modulos
    crea: v.number(), // Timestamp de creación
    metadata: v.optional(v.any()), // Campo extensible
  }).index("por_c_mod", ["c_mod"]),

  // ─────────────────────────────────────────────
  // MATRÍCULA
  // Relación muchos-a-muchos entre Usuario y Curso.
  // Registra la inscripción de un usuario en un curso.
  // ─────────────────────────────────────────────
  matricula: defineTable({
    c_curso: v.id("curso"), // FK a curso
    c_usuario: v.id("usuario"), // FK a usuario
    nombre: v.string(), // Nombre de la matriculación/programa
    crea: v.number(), // Timestamp de creación
    metadata: v.optional(v.any()), // Campo extensible
  })
    .index("por_c_usuario", ["c_usuario"])
    .index("por_c_curso", ["c_curso"]),
});
