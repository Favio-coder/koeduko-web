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

    // Quién habló. Se guardan las dos partes de la conversación, no solo al
    // estudiante: el reporte necesita la pregunta para interpretar la respuesta.
    role: v.optional(v.union(v.literal("user"), v.literal("assistant"))),

    // Segundo de la llamada en que arranca la frase, tal como lo reporta Vapi.
    // Ordena la conversación mejor que createdAt, que depende de cuándo llegó
    // el evento y no de cuándo se dijo.
    secondsFromStart: v.optional(v.number()),

    // Clave de idempotencia. El navegador y el webhook transcriben la misma
    // llamada en paralelo, así que la misma frase llega dos veces por caminos
    // distintos; sin esta clave la sesión quedaría duplicada entera.
    dedupeKey: v.optional(v.string()),

    // Vía por la que entró la frase. Solo para diagnóstico: permite ver si el
    // webhook está llegando o si todo viene del navegador.
    source: v.optional(v.union(v.literal("client"), v.literal("webhook"))),
  })
    .index("by_session", ["vapiSessionId"])
    .index("by_user", ["userId"])
    .index("by_dedupe", ["dedupeKey"]),

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

  // ─────────────────────────────────────────────
  // PLANES DE SESIÓN
  // Planificación que arma el docente antes de la clase.
  // "curso" y "grado" son texto libre y no FK a curso/instruccion: el docente
  // escribe el nombre a mano en el formulario. Si más adelante se eligen de una
  // lista, pasan a ser referencias.
  // ─────────────────────────────────────────────
  session_plans: defineTable({
    autorId: v.id("usuario"), // FK al docente que lo redactó

    titulo: v.string(),
    curso: v.string(),
    grado: v.string(),
    duracion: v.string(),
    fecha: v.string(), // ISO corta (YYYY-MM-DD), tal como la emite el <input type="date">

    proposito: v.string(),
    inicioActividades: v.string(),
    desarrolloActividades: v.string(),
    cierreActividades: v.string(),
    evaluacionEstrategia: v.string(),
    materialesRequeridos: v.string(),

    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_autor", ["autorId"]),

  // ─────────────────────────────────────────────
  // GRABACIONES DE AULA
  // Audio que el docente graba durante la clase. El archivo vive en el file
  // storage de Convex; acá queda solo la referencia.
  //
  // "transcripcion" está vacía hasta que haya un servicio de speech-to-text:
  // Claude analiza texto, no audio. El campo se deja preparado para no tener
  // que migrar la tabla cuando se conecte.
  // ─────────────────────────────────────────────
  classroom_recordings: defineTable({
    autorId: v.id("usuario"), // FK al docente que grabó

    storageId: v.id("_storage"), // Referencia al archivo en Convex storage
    duracionSegundos: v.number(),
    titulo: v.optional(v.string()),

    // Opcional: una grabación puede hacerse fuera de una sesión con el
    // asistente, así que no se exige vincularla a una.
    sessionId: v.optional(v.id("study_sessions")),

    transcripcion: v.optional(v.string()),
    estado: v.union(v.literal("guardada"), v.literal("transcrita")),

    createdAt: v.number(),
  })
    .index("by_autor", ["autorId"])
    .index("by_session", ["sessionId"]),
});
