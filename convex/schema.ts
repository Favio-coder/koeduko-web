import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * KOEDUKO - Schema de Base de Datos (Tablas en Español)
 *
 * Plataforma educativa peer-to-peer.
 * "Menos escuelas, más aprendizaje"
 *
 * Este schema define las 7 tablas core en español.
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
  // ROLES
  // Define los tipos de usuario en la plataforma.
  // Cada usuario DEBE tener un rol asignado.
  // Valores esperados: "instructor", "estudiante", "peer", "admin"
  // ─────────────────────────────────────────────
  roles: defineTable({
    nombre: v.string(), // Nombre del rol (ej: "instructor", "estudiante")
    desc: v.string(), // Descripción del rol y sus responsabilidades
    permisos: v.optional(v.any()), // Metadata flexible de permisos
    crea: v.number(), // Timestamp de creación (Date.now())
    metadata: v.optional(v.any()), // Campo extensible
  }).index("por_nombre", ["nombre"]),

  // ─────────────────────────────────────────────
  // INSTRUCCIÓN
  // Representa niveles educativos (ej: "Universitario", "Técnico", "Autodidacta").
  // Es tabla raíz: Usuario y Curso referencian a ella.
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
  // "rol_id" define qué puede hacer (instructor, estudiante, peer, admin).
  // "es_st" vincula al usuario con su nivel de instrucción (opcional).
  // ─────────────────────────────────────────────
  usuario: defineTable({
    nombre: v.string(), // Nombre completo del usuario
    genero: v.string(), // Género del usuario
    email: v.string(), // Email (único por usuario)
    carrera: v.string(), // Carrera o área de estudio
    rol_id: v.id("roles"), // FK a roles (REQUERIDO - define permisos)
    es_st: v.optional(v.id("instruccion")), // FK a instruccion (opcional, puede ser null)
    crea: v.number(), // Timestamp de creación
    metadata: v.optional(v.any()), // Campo extensible
  })
    .index("por_email", ["email"])
    .index("por_rol_id", ["rol_id"])
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

  // ═════════════════════════════════════════════
  // TABLAS EN INGLÉS — Tracking, P2P, Evaluación
  // ═════════════════════════════════════════════

  // Progreso de aprendizaje de un usuario en un curso
  learning_progress: defineTable({
    userId: v.id("usuario"),
    courseId: v.id("curso"),
    progressPercent: v.number(),
    completada: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"]),

  // Perfil P2P del usuario (bio, habilidades, disponibilidad)
  peer_profile: defineTable({
    userId: v.id("usuario"),
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    availability: v.optional(v.string()),
    learning_preferences: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Conexiones entre pares (solicitud de mentoría)
  peer_connections: defineTable({
    userId_from: v.id("usuario"),
    userId_to: v.id("usuario"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    mentorship_url: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_from", ["userId_from"])
    .index("by_to", ["userId_to"]),

  // Sesiones de estudio entre pares conectados
  study_sessions: defineTable({
    connectionId: v.id("peer_connections"),
    title: v.optional(v.string()),
    agenda: v.optional(v.string()),
    status: v.union(v.literal("scheduled"), v.literal("ongoing"), v.literal("completed")),
    mentoring_url: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_connection", ["connectionId"]),

  // Criterios de evaluación por curso
  course_evaluation_criteria: defineTable({
    courseId: v.id("curso"),
    name: v.string(),
    description: v.optional(v.string()),
    pass_mark: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_course", ["courseId"]),

  // ═════════════════════════════════════════════
  // TABLAS VAPI + ANÁLISIS IA
  // ═════════════════════════════════════════════

  vapi_sessions: defineTable({
    sessionId: v.id("study_sessions"),
    vapiCallId: v.string(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("failed")),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_call", ["vapiCallId"]),

  transcriptions: defineTable({
    vapiSessionId: v.id("vapi_sessions"),
    userId: v.id("usuario"),
    rawText: v.string(),
    timestamp: v.number(),
    createdAt: v.number(),
  })
    .index("by_session", ["vapiSessionId"])
    .index("by_user", ["userId"]),

  ai_analysis: defineTable({
    transcriptionId: v.id("transcriptions"),
    userId: v.id("usuario"),
    quality: v.number(), // 1-10
    understanding: v.boolean(),
    concepts: v.array(v.string()),
    sentiment: v.string(), // positive, neutral, negative
    response_text: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_transcription", ["transcriptionId"])
    .index("by_user", ["userId"]),

  session_reports: defineTable({
    sessionId: v.id("study_sessions"),
    userId: v.id("usuario"),
    totalParticipation: v.number(), // % de participación
    avgQuality: v.number(), // promedio de calidad (1-10)
    conceptsMastered: v.array(v.string()),
    conceptsMissed: v.array(v.string()),
    summaryText: v.string(),
    recommendations: v.array(v.string()),
    generatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),
});
