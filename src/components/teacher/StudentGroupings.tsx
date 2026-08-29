import { useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"

type Nivel = "Avanzado" | "Intermedio" | "Refuerzo"

interface StudentPerformance {
  id: string
  nombre: string
  carrera: string
  avgQuality: number | null
  participacion: number | null
  conceptosFlojos: string[]
  sesionesEvaluadas: number
}

interface EvaluatedStudent extends StudentPerformance {
  avgQuality: number
  nivel: Nivel
}

interface Group {
  id: string
  nombre: string
  estudiantes: EvaluatedStudent[]
  conceptosAReforzar: string[]
}

/** La calidad promedio viene en escala 1-10 desde session_reports. */
function nivelDe(avgQuality: number): Nivel {
  if (avgQuality >= 8) return "Avanzado"
  if (avgQuality >= 5) return "Intermedio"
  return "Refuerzo"
}

/**
 * Equipos que mezclan un estudiante de cada nivel, para que el de mayor
 * desempeño pueda acompañar al que necesita refuerzo.
 */
function armarGrupos(evaluados: EvaluatedStudent[]): Group[] {
  const ordenados = [...evaluados].sort((a, b) => b.avgQuality - a.avgQuality)
  const avanzados = ordenados.filter((s) => s.nivel === "Avanzado")
  const intermedios = ordenados.filter((s) => s.nivel === "Intermedio")
  const refuerzo = ordenados.filter((s) => s.nivel === "Refuerzo")

  const cantidadGrupos = Math.max(
    avanzados.length,
    intermedios.length,
    refuerzo.length
  )

  const grupos: Group[] = []
  for (let i = 0; i < cantidadGrupos; i++) {
    const integrantes = [avanzados[i], intermedios[i], refuerzo[i]].filter(
      (s): s is EvaluatedStudent => Boolean(s)
    )

    if (integrantes.length === 0) continue

    grupos.push({
      id: `group-${i + 1}`,
      nombre: `Equipo Peer #${i + 1}`,
      estudiantes: integrantes,
      // El foco sale de lo que el análisis marcó como no dominado, no de una
      // lista fija de temas.
      conceptosAReforzar: [
        ...new Set(integrantes.flatMap((s) => s.conceptosFlojos)),
      ].slice(0, 4),
    })
  }

  return grupos
}

export default function StudentGroupings() {
  const performance = useQuery(api.functions.groupings.listStudentPerformance) as
    | StudentPerformance[]
    | undefined

  const { grupos, evaluados, sinDatos } = useMemo(() => {
    if (!performance) {
      return { grupos: [], evaluados: [], sinDatos: [] as StudentPerformance[] }
    }

    const evaluados: EvaluatedStudent[] = performance
      .filter((s): s is StudentPerformance & { avgQuality: number } =>
        s.avgQuality !== null
      )
      .map((s) => ({ ...s, nivel: nivelDe(s.avgQuality) }))

    return {
      grupos: armarGrupos(evaluados),
      evaluados,
      sinDatos: performance.filter((s) => s.avgQuality === null),
    }
  }, [performance])

  if (performance === undefined) {
    return (
      <div style={styles.card}>
        <div style={styles.loadingBox}>
          <span style={styles.spinner} />
          <span>Cargando estudiantes desde Convex...</span>
        </div>
      </div>
    )
  }

  if (performance.length === 0) {
    return (
      <div style={styles.card}>
        <div style={styles.emptyBox}>
          <p style={styles.emptyTitle}>No hay estudiantes registrados</p>
          <p style={styles.emptyDesc}>
            Se agrupan los usuarios con rol "estudiante". Registrá estudiantes
            para poder formar equipos.
          </p>
        </div>
      </div>
    )
  }

  const nivelBadge = (nivel: Nivel) => {
    const estilos: Record<Nivel, React.CSSProperties> = {
      Avanzado: { backgroundColor: "#e0f2fe", color: "#0369a1" },
      Intermedio: { backgroundColor: "#fef3c7", color: "#92400e" },
      Refuerzo: { backgroundColor: "#fee2e2", color: "#b91c1c" },
    }
    const icono = { Avanzado: "⚡", Intermedio: "⚖️", Refuerzo: "🌱" }[nivel]
    return (
      <span style={{ ...styles.badge, ...estilos[nivel] }}>
        {icono} {nivel}
      </span>
    )
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.iconBadge}>👥</div>
          <div>
            <h3 style={styles.title}>Agrupaciones Inteligentes Peer-to-Peer</h3>
            <p style={styles.subtitle}>
              Equipos balanceados según los reportes de las sesiones analizadas
            </p>
          </div>
        </div>

        <div style={styles.livePill}>
          <span style={styles.pulseDot} />
          <span>Actualizado en vivo</span>
        </div>
      </div>

      {/* Summary Chips */}
      <div style={styles.summaryBar}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Estudiantes</span>
          <span style={styles.summaryVal}>{performance.length}</span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Con desempeño medido</span>
          <span style={styles.summaryVal}>{evaluados.length}</span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Grupos Formados</span>
          <span style={styles.summaryVal}>{grupos.length}</span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Estrategia Peer</span>
          <span style={styles.summaryVal}>Mentor + Intermedio + Refuerzo</span>
        </div>
      </div>

      {/* Groups Grid */}
      {grupos.length > 0 && (
        <div style={styles.groupsGrid}>
          {grupos.map((group) => (
            <div key={group.id} style={styles.groupCard}>
              <div style={styles.groupHeader}>
                <span style={styles.groupTitle}>{group.nombre}</span>
                <span style={styles.groupCount}>
                  {group.estudiantes.length} integrantes
                </span>
              </div>

              <div style={styles.challengeBox}>
                <span style={styles.challengeLabel}>
                  🎯 Conceptos a reforzar en el equipo:
                </span>
                {group.conceptosAReforzar.length > 0 ? (
                  <div style={styles.chipsRow}>
                    {group.conceptosAReforzar.map((concepto) => (
                      <span key={concepto} style={styles.conceptChip}>
                        {concepto}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={styles.challengeText}>
                    El análisis todavía no marcó conceptos pendientes en este equipo.
                  </p>
                )}
              </div>

              <div style={styles.membersList}>
                <span style={styles.membersHeader}>Integrantes y Rol Peer:</span>
                {group.estudiantes.map((student, sIdx) => (
                  <div key={student.id} style={styles.memberRow}>
                    <div style={styles.studentInfo}>
                      <span style={styles.roleTag}>
                        {sIdx === 0
                          ? "👑 Facilitador"
                          : sIdx === 1
                          ? "📝 Sintetizador"
                          : "🤝 Co-estudiante"}
                      </span>
                      <span style={styles.studentName}>{student.nombre}</span>
                      <span style={styles.studentMeta}>({student.carrera})</span>
                    </div>
                    <div style={styles.studentStats}>
                      {nivelBadge(student.nivel)}
                      <span style={styles.scorePill}>
                        {student.avgQuality}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estudiantes todavía sin reportes */}
      {sinDatos.length > 0 && (
        <div style={styles.pendingSection}>
          <h4 style={styles.pendingTitle}>
            Sin desempeño medido todavía ({sinDatos.length})
          </h4>
          <p style={styles.pendingDesc}>
            Estos estudiantes no participaron aún en una sesión analizada, así que
            no se pueden agrupar por rendimiento.
          </p>
          <div style={styles.pendingList}>
            {sinDatos.map((student) => (
              <div key={student.id} style={styles.pendingChip}>
                <span style={styles.studentName}>{student.nombre}</span>
                <span style={styles.studentMeta}>{student.carrera}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    border: "1px solid #eef2ef",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  titleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  iconBadge: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "#eaf5ed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  livePill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 14px",
    backgroundColor: "#eaf5ed",
    color: "#2e7d48",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2e7d48",
  },
  summaryBar: {
    display: "flex",
    gap: "24px",
    backgroundColor: "#f8faf8",
    padding: "14px 20px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    flexWrap: "wrap",
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  summaryLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748b",
  },
  summaryVal: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1e293b",
  },
  groupsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  groupCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid #eef2ef",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  groupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "10px",
    borderBottom: "1px solid #f1f5f9",
  },
  groupTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#2e7d48",
  },
  groupCount: {
    fontSize: "12px",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: "8px",
  },
  challengeBox: {
    backgroundColor: "#f8faf8",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  challengeLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#475569",
    display: "block",
    marginBottom: "6px",
  },
  challengeText: {
    fontSize: "12px",
    color: "#64748b",
    fontStyle: "italic",
    margin: 0,
  },
  chipsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  conceptChip: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#1e293b",
    backgroundColor: "#ffffff",
    padding: "4px 10px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
  },
  membersList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  membersHeader: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
  },
  memberRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    border: "1px solid #f1f5f9",
    flexWrap: "wrap",
    gap: "8px",
  },
  studentInfo: {
    display: "flex",
    flexDirection: "column",
  },
  roleTag: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#2e7d48",
  },
  studentName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#1e293b",
  },
  studentMeta: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  studentStats: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  badge: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: "8px",
  },
  scorePill: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#475569",
    backgroundColor: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: "6px",
  },
  pendingSection: {
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },
  pendingTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  pendingDesc: {
    fontSize: "12px",
    color: "#64748b",
    margin: "0 0 12px 0",
  },
  pendingList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  pendingChip: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 14px",
    backgroundColor: "#f8faf8",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },
  loadingBox: {
    padding: "40px",
    textAlign: "center" as const,
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid #cbd5e1",
    borderTopColor: "#2e7d48",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  emptyBox: {
    padding: "32px",
    textAlign: "center" as const,
  },
  emptyTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 6px 0",
  },
  emptyDesc: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
}
