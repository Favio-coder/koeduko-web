/**
 * DocenteStats — Estadísticas del Docente
 * Muestra distribución de calificaciones, progreso de estudiantes,
 * actividad de sesiones y métricas de participación.
 *
 * TODO: Reemplazar statsData con queries reales de Convex cuando estén disponibles:
 *   - useQuery(api.estadisticas.docenteResumen, { docenteId })
 *   - useQuery(api.estadisticas.distribucionNotas, { cursoId })
 *   - useQuery(api.estadisticas.progresoPorEstudiante, { cursoId })
 */

interface GradeLevel {
  label: string
  percent: number
  color: string
  count: number
}

interface StudentProgress {
  nombre: string
  curso: string
  progreso: number
  nota: number
  estado: "Excelente" | "Regular" | "Necesita refuerzo"
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const GRADE_DISTRIBUTION: GradeLevel[] = [
  { label: "Sobresaliente (18-20)", percent: 28, count: 13, color: "#2e7d48" },
  { label: "Avanzado (16-17)",      percent: 42, count: 20, color: "#3b82f6" },
  { label: "Intermedio (13-15)",    percent: 22, count: 11, color: "#f59e0b" },
  { label: "Refuerzo (0-12)",       percent: 8,  count: 4,  color: "#ef4444" },
]

const STUDENT_PROGRESS: StudentProgress[] = [
  { nombre: "Estudiante Carlos",  curso: "POO-2026", progreso: 95, nota: 19.0, estado: "Excelente" },
  { nombre: "Lucía Fernández",    curso: "POO-2026", progreso: 72, nota: 14.5, estado: "Regular" },
  { nombre: "Marco Villanueva",   curso: "AED-2026", progreso: 88, nota: 17.8, estado: "Excelente" },
  { nombre: "Sofía Ramírez",      curso: "AED-2026", progreso: 48, nota: 11.0, estado: "Necesita refuerzo" },
  { nombre: "Diego Pérez",        curso: "POO-2026", progreso: 80, nota: 16.2, estado: "Avanzado" as unknown as "Excelente" },
]

const MONTHLY_SESSIONS = [
  { mes: "Jun", count: 6 },
  { mes: "Jul", count: 9 },
  { mes: "Ago", count: 14 },
]

const SUMMARY_METRICS = {
  totalEstudiantes: 48,
  sesionesMes: 14,
  horasAudio: 42,
  promedioParticipacion: 88,
  tasaAsistencia: 91,
  sesionesGrabadas: 14,
  satisfaccionPromedio: 4.7,
}

// ─────────────────────────────────────────────────────────────────────────────

function StatusPill({ estado }: { estado: StudentProgress["estado"] }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    "Excelente":         { bg: "#eaf5ed", color: "#2e7d48", label: "✅ Excelente" },
    "Regular":           { bg: "#fef3c7", color: "#92400e", label: "⚠️ Regular" },
    "Necesita refuerzo": { bg: "#fee2e2", color: "#991b1b", label: "🔴 Refuerzo" },
    "Avanzado":          { bg: "#e0f2fe", color: "#0369a1", label: "🔵 Avanzado" },
  }
  const cfg = map[estado] ?? map["Regular"]
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: "8px",
        backgroundColor: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  )
}

export default function DocenteStats() {
  const maxSessions = Math.max(...MONTHLY_SESSIONS.map((m) => m.count))

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>📊 Estadísticas y Rendimiento del Aula</h2>
          <p style={s.subtitle}>
            Resumen general de tus estudiantes, sesiones grabadas y métricas de aprendizaje
          </p>
        </div>
        <span style={s.dateBadge}>Ciclo 2026-II</span>
      </div>

      {/* KPI Summary Row */}
      <div style={s.kpiGrid}>
        {[
          { icon: "👥", val: SUMMARY_METRICS.totalEstudiantes, label: "Estudiantes" },
          { icon: "🎙️", val: SUMMARY_METRICS.sesionesMes,      label: "Sesiones este mes" },
          { icon: "⏱️", val: `${SUMMARY_METRICS.horasAudio} h`, label: "Horas de audio" },
          { icon: "📈", val: `${SUMMARY_METRICS.promedioParticipacion}%`, label: "Participación avg." },
          { icon: "📅", val: `${SUMMARY_METRICS.tasaAsistencia}%`,        label: "Asistencia avg." },
          { icon: "⭐", val: `${SUMMARY_METRICS.satisfaccionPromedio}/5`,  label: "Satisfacción" },
        ].map((kpi) => (
          <div key={kpi.label} style={s.kpiCard}>
            <span style={s.kpiIcon}>{kpi.icon}</span>
            <div>
              <span style={s.kpiVal}>{kpi.val}</span>
              <span style={s.kpiLabel}>{kpi.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Grade Distribution + Session Activity */}
      <div style={s.twoCol}>
        {/* Grade Distribution */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>🎓 Distribución de Calificaciones</h3>
          <p style={s.cardSub}>Basado en {GRADE_DISTRIBUTION.reduce((a, b) => a + b.count, 0)} estudiantes evaluados</p>
          <div style={s.gradeList}>
            {GRADE_DISTRIBUTION.map((level) => (
              <div key={level.label} style={s.gradeRow}>
                <div style={s.gradeMetaRow}>
                  <span style={s.gradeLabel}>{level.label}</span>
                  <span style={{ ...s.gradePct, color: level.color }}>
                    {level.count} ({level.percent}%)
                  </span>
                </div>
                <div style={s.barBg}>
                  <div
                    style={{
                      ...s.barFill,
                      width: `${level.percent}%`,
                      backgroundColor: level.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Session Activity */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>🗓️ Sesiones por Mes</h3>
          <p style={s.cardSub}>Actividad de sesiones grabadas por mes</p>
          <div style={s.barChart}>
            {MONTHLY_SESSIONS.map((m) => {
              const heightPct = (m.count / maxSessions) * 100
              return (
                <div key={m.mes} style={s.barCol}>
                  <span style={s.barColVal}>{m.count}</span>
                  <div style={s.barColBg}>
                    <div
                      style={{
                        ...s.barColFill,
                        height: `${heightPct}%`,
                      }}
                    />
                  </div>
                  <span style={s.barColLabel}>{m.mes}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Student Progress Table */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>📋 Progreso Individual de Estudiantes</h3>
        <p style={s.cardSub}>Vista rápida del avance de cada estudiante en tus cursos</p>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Estudiante", "Curso", "Progreso", "Nota", "Estado"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STUDENT_PROGRESS.map((sp) => (
                <tr key={sp.nombre} style={s.tr}>
                  <td style={s.td}>
                    <span style={s.studentAvatar}>👨‍🎓</span>
                    {sp.nombre}
                  </td>
                  <td style={s.td}>
                    <code style={s.courseCode}>{sp.curso}</code>
                  </td>
                  <td style={s.td}>
                    <div style={s.miniBarBg}>
                      <div
                        style={{
                          ...s.miniBarFill,
                          width: `${sp.progreso}%`,
                          backgroundColor: sp.progreso >= 80 ? "#2e7d48" : sp.progreso >= 60 ? "#3b82f6" : "#f59e0b",
                        }}
                      />
                    </div>
                    <span style={s.miniBarLabel}>{sp.progreso}%</span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 700, color: sp.nota >= 16 ? "#2e7d48" : sp.nota >= 13 ? "#d97706" : "#dc2626" }}>
                    {sp.nota.toFixed(1)}
                  </td>
                  <td style={s.td}>
                    <StatusPill estado={sp.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Banner */}
      <div style={s.insightBanner}>
        <span style={s.insightIcon}>💡</span>
        <div>
          <p style={s.insightTitle}>Recomendación del sistema</p>
          <p style={s.insightText}>
            4 estudiantes se encuentran en nivel de refuerzo. Considera organizar una sesión Peer de apoyo
            con los alumnos destacados como mentores para nivelar al grupo antes del examen final.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  container:    { display: "flex", flexDirection: "column", gap: "24px" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" },
  title:        { fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px 0" },
  subtitle:     { fontSize: "13px", color: "#64748b", margin: 0 },
  dateBadge:    { fontSize: "12px", fontWeight: 700, backgroundColor: "#eaf5ed", color: "#2e7d48", padding: "4px 12px", borderRadius: "20px", whiteSpace: "nowrap" },

  kpiGrid:      { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" },
  kpiCard:      { backgroundColor: "#ffffff", borderRadius: "16px", padding: "18px 20px", border: "1px solid #eef2ef", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "14px" },
  kpiIcon:      { fontSize: "24px", padding: "10px", backgroundColor: "#f7f9f7", borderRadius: "12px" },
  kpiVal:       { display: "block", fontSize: "20px", fontWeight: 800, color: "#1e293b" },
  kpiLabel:     { display: "block", fontSize: "11px", color: "#64748b", fontWeight: 500 },

  twoCol:       { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" },
  card:         { backgroundColor: "#ffffff", borderRadius: "20px", padding: "24px", border: "1px solid #eef2ef", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "16px" },
  cardTitle:    { fontSize: "16px", fontWeight: 800, color: "#1e293b", margin: 0 },
  cardSub:      { fontSize: "12px", color: "#64748b", margin: 0, marginTop: "-10px" },

  gradeList:    { display: "flex", flexDirection: "column", gap: "14px" },
  gradeRow:     { display: "flex", flexDirection: "column", gap: "6px" },
  gradeMetaRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  gradeLabel:   { fontSize: "12px", fontWeight: 600, color: "#334155" },
  gradePct:     { fontSize: "12px", fontWeight: 700 },
  barBg:        { width: "100%", height: "10px", backgroundColor: "#f1f5f9", borderRadius: "6px", overflow: "hidden" },
  barFill:      { height: "100%", borderRadius: "6px", transition: "width 0.4s ease" },

  barChart:     { display: "flex", alignItems: "flex-end", gap: "20px", height: "160px", paddingBottom: "4px" },
  barCol:       { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 },
  barColVal:    { fontSize: "13px", fontWeight: 700, color: "#1e293b" },
  barColBg:     { width: "100%", height: "120px", backgroundColor: "#f1f5f9", borderRadius: "8px", display: "flex", alignItems: "flex-end", overflow: "hidden" },
  barColFill:   { width: "100%", backgroundColor: "#2e7d48", borderRadius: "8px", transition: "height 0.4s ease" },
  barColLabel:  { fontSize: "12px", fontWeight: 600, color: "#64748b" },

  tableWrap:    { overflowX: "auto" as const },
  table:        { width: "100%", borderCollapse: "collapse" as const, fontSize: "13px" },
  th:           { textAlign: "left" as const, padding: "10px 12px", borderBottom: "2px solid #f1f5f9", fontSize: "12px", fontWeight: 700, color: "#64748b" },
  tr:           { borderBottom: "1px solid #f8f9fa" },
  td:           { padding: "12px 12px", color: "#334155", verticalAlign: "middle" as const },
  studentAvatar:{ marginRight: "8px" },
  courseCode:   { fontSize: "11px", fontWeight: 700, backgroundColor: "#eaf5ed", color: "#2e7d48", padding: "2px 8px", borderRadius: "6px" },

  miniBarBg:    { display: "inline-block", width: "80px", height: "8px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden", verticalAlign: "middle", marginRight: "6px" },
  miniBarFill:  { height: "100%", borderRadius: "4px" },
  miniBarLabel: { fontSize: "12px", fontWeight: 700, color: "#1e293b", verticalAlign: "middle" },

  insightBanner: { backgroundColor: "#fffbeb", borderRadius: "16px", padding: "20px 24px", border: "1px solid #fde68a", display: "flex", alignItems: "flex-start", gap: "16px" },
  insightIcon:   { fontSize: "28px", flexShrink: 0 },
  insightTitle:  { fontSize: "14px", fontWeight: 700, color: "#92400e", marginBottom: "4px" },
  insightText:   { fontSize: "13px", color: "#78350f", lineHeight: 1.5, margin: 0 },
}
