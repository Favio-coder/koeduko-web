/**
 * DocenteCourses — Gestión de Cursos del Docente
 *
 * El docente puede:
 *  ✅ Ver todos sus cursos asignados
 *  ✅ Ver cantidad de estudiantes
 *  ✅ Ver módulos activos
 *  ✅ Ver progreso promedio del grupo
 *  ✅ Abrir vista de gestión de estudiantes/contenido
 *
 * TODO: Reemplazar MOCK_COURSES con query real:
 *   useQuery(api.cursos.porDocente, { docenteId })
 */

import { useState } from "react"

interface DocenteCourse {
  id: string
  codigo: string
  nombre: string
  nivel: string
  totalEstudiantes: number
  modulosActivos: number
  progresoPromedio: number
  proximaSesion: string
  estado: "Activo" | "En pausa" | "Finalizado"
  color: string
  sesionesGrabadas: number
}

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_COURSES: DocenteCourse[] = [
  {
    id: "dc-1",
    codigo: "POO-2026",
    nombre: "Programación Orientada a Objetos",
    nivel: "Universitario - Ciclo III",
    totalEstudiantes: 24,
    modulosActivos: 8,
    progresoPromedio: 72,
    proximaSesion: "Martes, 10:00 AM",
    estado: "Activo",
    color: "#2e7d48",
    sesionesGrabadas: 8,
  },
  {
    id: "dc-2",
    codigo: "AED-2026",
    nombre: "Algoritmos y Estructura de Datos",
    nivel: "Universitario - Ciclo IV",
    totalEstudiantes: 18,
    modulosActivos: 6,
    progresoPromedio: 58,
    proximaSesion: "Jueves, 3:00 PM",
    estado: "Activo",
    color: "#0284c7",
    sesionesGrabadas: 6,
  },
  {
    id: "dc-3",
    codigo: "IAML-2026",
    nombre: "Introducción a Inteligencia Artificial",
    nivel: "Universitario - Ciclo VI",
    totalEstudiantes: 6,
    modulosActivos: 4,
    progresoPromedio: 45,
    proximaSesion: "Viernes, 9:00 AM",
    estado: "Activo",
    color: "#7c3aed",
    sesionesGrabadas: 0,
  },
]

// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ estado }: { estado: DocenteCourse["estado"] }) {
  const map = {
    "Activo":     { bg: "#eaf5ed", color: "#2e7d48", label: "🟢 Activo" },
    "En pausa":   { bg: "#fef3c7", color: "#92400e", label: "🟡 En pausa" },
    "Finalizado": { bg: "#f1f5f9", color: "#64748b", label: "⚫ Finalizado" },
  }
  const c = map[estado]
  return (
    <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: c.bg, color: c.color, padding: "4px 10px", borderRadius: "10px" }}>
      {c.label}
    </span>
  )
}

export default function DocenteCourses() {
  const [courses] = useState<DocenteCourse[]>(MOCK_COURSES)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id)

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>📚 Mis Cursos Asignados</h2>
          <p style={s.subtitle}>Gestiona el contenido, estudiantes y sesiones de cada curso</p>
        </div>
        <div style={s.summaryPills}>
          <span style={s.pill}>📚 {courses.length} Cursos</span>
          <span style={s.pill}>
            👥 {courses.reduce((t, c) => t + c.totalEstudiantes, 0)} Estudiantes
          </span>
        </div>
      </div>

      {/* Course Cards */}
      <div style={s.grid}>
        {courses.map((course) => (
          <div key={course.id} style={s.card}>
            {/* Top color stripe */}
            <div style={{ ...s.colorStripe, backgroundColor: course.color }} />

            <div style={s.cardBody}>
              {/* Card header */}
              <div style={s.cardTop}>
                <div style={s.codeBadgeRow}>
                  <span style={{ ...s.codeBadge, backgroundColor: `${course.color}18`, color: course.color }}>
                    {course.codigo}
                  </span>
                  <StatusBadge estado={course.estado} />
                </div>
              </div>

              <h3 style={s.courseName}>{course.nombre}</h3>
              <p style={s.courseLevel}>🎓 {course.nivel}</p>

              {/* Metrics Row */}
              <div style={s.metricsRow}>
                <div style={s.metricBox}>
                  <span style={s.metricVal}>{course.totalEstudiantes}</span>
                  <span style={s.metricLabel}>Estudiantes</span>
                </div>
                <div style={s.metricBox}>
                  <span style={s.metricVal}>{course.modulosActivos}</span>
                  <span style={s.metricLabel}>Módulos</span>
                </div>
                <div style={s.metricBox}>
                  <span style={s.metricVal}>{course.sesionesGrabadas}</span>
                  <span style={s.metricLabel}>Grabaciones</span>
                </div>
              </div>

              {/* Progress */}
              <div style={s.progressSection}>
                <div style={s.progressHeader}>
                  <span style={s.progressLabel}>Progreso promedio del grupo</span>
                  <span style={s.progressVal}>{course.progresoPromedio}%</span>
                </div>
                <div style={s.progressBg}>
                  <div
                    style={{
                      ...s.progressFill,
                      width: `${course.progresoPromedio}%`,
                      backgroundColor: course.color,
                    }}
                  />
                </div>
              </div>

              {/* Next Session */}
              <div style={s.nextSession}>
                <span style={s.nextSessionIcon}>🗓️</span>
                <span style={s.nextSessionText}>Próxima sesión: <strong>{course.proximaSesion}</strong></span>
              </div>

              {/* Actions */}
              <div style={s.actions}>
                <button
                  onClick={() => toggleExpand(course.id)}
                  style={s.primaryBtn}
                >
                  {expandedId === course.id ? "Ocultar detalles ▲" : "Gestionar Curso ▼"}
                </button>
              </div>

              {/* Expandable Detail Panel */}
              {expandedId === course.id && (
                <div style={s.expandPanel}>
                  <div style={s.expandGrid}>
                    <button
                      style={s.expandAction}
                      onClick={() => alert(`Abriendo lista de estudiantes de ${course.nombre}`)}
                    >
                      👥 Ver Estudiantes
                    </button>
                    <button
                      style={s.expandAction}
                      onClick={() => alert(`Abriendo módulos de ${course.nombre}`)}
                    >
                      📂 Ver Módulos
                    </button>
                    <button
                      style={s.expandAction}
                      onClick={() => alert(`Abriendo grabaciones de ${course.nombre}`)}
                    >
                      🎥 Grabaciones ({course.sesionesGrabadas})
                    </button>
                    <button
                      style={s.expandAction}
                      onClick={() => alert(`Abriendo estadísticas de ${course.nombre}`)}
                    >
                      📊 Estadísticas
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  container:     { display: "flex", flexDirection: "column", gap: "24px" },
  header:        { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" },
  title:         { fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px 0" },
  subtitle:      { fontSize: "13px", color: "#64748b", margin: 0 },
  summaryPills:  { display: "flex", gap: "8px", flexWrap: "wrap" },
  pill:          { fontSize: "12px", fontWeight: 700, backgroundColor: "#eaf5ed", color: "#2e7d48", padding: "6px 14px", borderRadius: "20px" },

  grid:          { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
  card:          { backgroundColor: "#ffffff", borderRadius: "20px", border: "1px solid #eef2ef", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", overflow: "hidden" },
  colorStripe:   { height: "6px", width: "100%" },
  cardBody:      { padding: "24px", display: "flex", flexDirection: "column", gap: "14px" },

  cardTop:       { display: "flex", justifyContent: "space-between", alignItems: "center" },
  codeBadgeRow:  { display: "flex", gap: "8px", alignItems: "center" },
  codeBadge:     { fontSize: "11px", fontWeight: 800, padding: "4px 10px", borderRadius: "8px" },

  courseName:    { fontSize: "17px", fontWeight: 800, color: "#1e293b", margin: 0, lineHeight: 1.3 },
  courseLevel:   { fontSize: "12px", color: "#64748b", margin: 0 },

  metricsRow:    { display: "flex", gap: "12px" },
  metricBox:     { flex: 1, backgroundColor: "#f8faf8", borderRadius: "10px", padding: "10px", textAlign: "center" as const, border: "1px solid #eef2ef" },
  metricVal:     { display: "block", fontSize: "18px", fontWeight: 800, color: "#1e293b" },
  metricLabel:   { display: "block", fontSize: "10px", color: "#64748b", fontWeight: 500 },

  progressSection:{ display: "flex", flexDirection: "column", gap: "6px" },
  progressHeader: { display: "flex", justifyContent: "space-between" },
  progressLabel:  { fontSize: "11px", fontWeight: 600, color: "#64748b" },
  progressVal:    { fontSize: "12px", fontWeight: 700, color: "#1e293b" },
  progressBg:     { width: "100%", height: "8px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden" },
  progressFill:   { height: "100%", borderRadius: "4px" },

  nextSession:    { display: "flex", gap: "8px", alignItems: "center", backgroundColor: "#f8faf8", padding: "10px 12px", borderRadius: "10px" },
  nextSessionIcon:{ fontSize: "14px" },
  nextSessionText:{ fontSize: "12px", color: "#334155" },

  actions:        { display: "flex", gap: "10px" },
  primaryBtn:     { flex: 1, padding: "10px", backgroundColor: "#2e7d48", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer" },

  expandPanel:    { backgroundColor: "#f8faf8", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0" },
  expandGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  expandAction:   { padding: "10px 14px", backgroundColor: "#ffffff", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", textAlign: "left" as const },
}
