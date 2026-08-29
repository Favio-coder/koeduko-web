import { useState } from "react"
import EmptyState from "../common/EmptyState"

export interface CourseItem {
  id: string
  nombre: string
  docente: string
  progreso: number
  calificacion: number
  ultimaActividad: string
  proximaSesion: string
  bannerColor: string
}

const DEFAULT_COURSES: CourseItem[] = [
  {
    id: "c1",
    nombre: "Desarrollo Web Fullstack con React y Convex",
    docente: "Profesor Ana",
    progreso: 85,
    calificacion: 18.5,
    ultimaActividad: "Hace 2 horas",
    proximaSesion: "Mañana, 10:00 AM",
    bannerColor: "#2e7d48",
  },
  {
    id: "c2",
    nombre: "Estructura de Datos y Algoritmos Avanzados",
    docente: "Profesor Ana",
    progreso: 60,
    calificacion: 16.0,
    ultimaActividad: "Ayer",
    proximaSesion: "Viernes, 3:00 PM",
    bannerColor: "#0284c7",
  },
  {
    id: "c3",
    nombre: "Inteligencia Artificial para Aprendizaje P2P",
    docente: "Dra. Carmen Silva",
    progreso: 40,
    calificacion: 17.2,
    ultimaActividad: "Hace 3 días",
    proximaSesion: "Lunes, 9:00 AM",
    bannerColor: "#7c3aed",
  },
]

export default function StudentCourses() {
  const [courses] = useState<CourseItem[]>(DEFAULT_COURSES)

  if (courses.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="No estás matriculado en ningún curso"
        description="Explora el catálogo de cursos disponibles para comenzar tu ruta de aprendizaje en KoEduko."
      />
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Mis Cursos Matriculados</h2>
          <p style={styles.subtitle}>
            Sigue tu avance académico y mantente al día con tus próximas sesiones
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        {courses.map((course) => (
          <div key={course.id} style={styles.card}>
            {/* Top Color Accent */}
            <div style={{ ...styles.colorAccent, backgroundColor: course.bannerColor }} />

            <div style={styles.cardBody}>
              <div style={styles.courseHeader}>
                <span style={styles.courseDocente}>👨‍🏫 {course.docente}</span>
                <span style={styles.scoreBadge}>⭐ {course.calificacion} / 20</span>
              </div>

              <h3 style={styles.courseTitle}>{course.nombre}</h3>

              {/* Progress Bar */}
              <div style={styles.progressBox}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>Progreso del curso</span>
                  <span style={styles.progressVal}>{course.progreso}%</span>
                </div>
                <div style={styles.progressBg}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${course.progreso}%`,
                      backgroundColor: course.bannerColor,
                    }}
                  />
                </div>
              </div>

              <div style={styles.metaRow}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Última actividad:</span>
                  <span style={styles.metaValue}>{course.ultimaActividad}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Próxima sesión:</span>
                  <span style={styles.metaValueHighlight}>{course.proximaSesion}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    marginBottom: "4px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid #eef2ef",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.03)",
    display: "flex",
    flexDirection: "column",
  },
  colorAccent: {
    height: "6px",
    width: "100%",
  },
  cardBody: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  courseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseDocente: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
  },
  scoreBadge: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#d97706",
    backgroundColor: "#fef3c7",
    padding: "4px 8px",
    borderRadius: "8px",
  },
  courseTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
    lineHeight: 1.4,
  },
  progressBox: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    fontWeight: 600,
  },
  progressLabel: {
    color: "#64748b",
  },
  progressVal: {
    color: "#1e293b",
    fontWeight: 700,
  },
  progressBg: {
    width: "100%",
    height: "8px",
    backgroundColor: "#f1f5f9",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "4px",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
    fontSize: "12px",
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  metaLabel: {
    color: "#94a3b8",
  },
  metaValue: {
    color: "#334155",
    fontWeight: 600,
  },
  metaValueHighlight: {
    color: "#2e7d48",
    fontWeight: 700,
  },
}
