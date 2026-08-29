import { useState } from "react"

export interface Student {
  id: string
  nombre: string
  nivel: "Avanzado" | "Intermedio" | "Refuerzo"
  desempenoAudio: number
  carrera: string
}

export interface Group {
  id: string
  nombre: string
  estudiantes: Student[]
  retoAsignado: string
}

interface StudentGroupingsProps {
  studentsList?: Student[]
}

const DEFAULT_STUDENTS: Student[] = [
  { id: "1", nombre: "Carlos Mendoza", nivel: "Avanzado", desempenoAudio: 92, carrera: "Ingeniería" },
  { id: "2", nombre: "Lucía Fernández", nivel: "Refuerzo", desempenoAudio: 64, carrera: "Diseño" },
  { id: "3", nombre: "Miguel Torres", nivel: "Intermedio", desempenoAudio: 78, carrera: "Programación" },
  { id: "4", nombre: "Sofía Ramos", nivel: "Avanzado", desempenoAudio: 88, carrera: "Matemáticas" },
  { id: "5", nombre: "Jorge Benítez", nivel: "Refuerzo", desempenoAudio: 58, carrera: "Sistemas" },
  { id: "6", nombre: "Elena Gómez", nivel: "Intermedio", desempenoAudio: 81, carrera: "Estadística" },
  { id: "7", nombre: "Diego Paredes", nivel: "Refuerzo", desempenoAudio: 61, carrera: "Física" },
  { id: "8", nombre: "Valeria Ríos", nivel: "Avanzado", desempenoAudio: 95, carrera: "Informática" },
]

export default function StudentGroupings({ studentsList = DEFAULT_STUDENTS }: StudentGroupingsProps) {
  const [groups, setGroups] = useState<Group[]>(() => generatePeerGroups(studentsList))

  function generatePeerGroups(list: Student[]): Group[] {
    const sorted = [...list].sort((a, b) => b.desempenoAudio - a.desempenoAudio)
    const advanced = sorted.filter((s) => s.nivel === "Avanzado")
    const intermediate = sorted.filter((s) => s.nivel === "Intermedio")
    const support = sorted.filter((s) => s.nivel === "Refuerzo")

    const newGroups: Group[] = []
    const numGroups = Math.max(advanced.length, 2)

    for (let i = 0; i < numGroups; i++) {
      const members: Student[] = []
      if (advanced[i]) members.push(advanced[i])
      if (intermediate[i]) members.push(intermediate[i])
      if (support[i]) members.push(support[i])

      // Any overflow
      if (!members.length && sorted[i]) members.push(sorted[i])

      newGroups.push({
        id: `group-${i + 1}`,
        nombre: `Equipo Peer #${i + 1}`,
        estudiantes: members,
        retoAsignado:
          i === 0
            ? "Implementar función recursiva con manejo de excepciones"
            : i === 1
            ? "Construir algoritmo de búsqueda binaria y probar casos borde"
            : "Diseñar estructura de datos para carrito de compras",
      })
    }

    return newGroups
  }

  const handleRegenerate = () => {
    setGroups(generatePeerGroups(studentsList))
  }

  const getNivelBadge = (nivel: Student["nivel"]) => {
    switch (nivel) {
      case "Avanzado":
        return <span style={{ ...styles.badge, backgroundColor: "#e0f2fe", color: "#0369a1" }}>⚡ Avanzado</span>
      case "Intermedio":
        return <span style={{ ...styles.badge, backgroundColor: "#fef3c7", color: "#92400e" }}>⚖️ Intermedio</span>
      case "Refuerzo":
        return <span style={{ ...styles.badge, backgroundColor: "#fee2e2", color: "#b91c1c" }}>🌱 Refuerzo</span>
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.iconBadge}>👥</div>
          <div>
            <h3 style={styles.title}>Agrupaciones Inteligentes Peer-to-Peer</h3>
            <p style={styles.subtitle}>
              Equipos balanceados según el análisis de rendimiento escuchado en la sesión
            </p>
          </div>
        </div>

        <button onClick={handleRegenerate} style={styles.refreshBtn}>
          🔄 Re-generar Equipos
        </button>
      </div>

      {/* Summary Chips */}
      <div style={styles.summaryBar}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Total Estudiantes</span>
          <span style={styles.summaryVal}>{studentsList.length}</span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Grupos Formados</span>
          <span style={styles.summaryVal}>{groups.length}</span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Estrategia Peer</span>
          <span style={styles.summaryVal}>Mentor + Intermedio + Refuerzo</span>
        </div>
      </div>

      {/* Groups Grid */}
      <div style={styles.groupsGrid}>
        {groups.map((group) => (
          <div key={group.id} style={styles.groupCard}>
            <div style={styles.groupHeader}>
              <span style={styles.groupTitle}>{group.nombre}</span>
              <span style={styles.groupCount}>{group.estudiantes.length} integrantes</span>
            </div>

            <div style={styles.challengeBox}>
              <span style={styles.challengeLabel}>🎯 Reto asignado al equipo:</span>
              <p style={styles.challengeText}>"{group.retoAsignado}"</p>
            </div>

            <div style={styles.membersList}>
              <span style={styles.membersHeader}>Integrantes y Rol Peer:</span>
              {group.estudiantes.map((student, sIdx) => (
                <div key={student.id} style={styles.memberRow}>
                  <div style={styles.studentInfo}>
                    <span style={styles.roleTag}>
                      {sIdx === 0 ? "👑 Facilitador" : sIdx === 1 ? "📝 Sintetizador" : "🤝 Co-estudiante"}
                    </span>
                    <span style={styles.studentName}>{student.nombre}</span>
                    <span style={styles.studentMeta}>({student.carrera})</span>
                  </div>
                  <div style={styles.studentStats}>
                    {getNivelBadge(student.nivel)}
                    <span style={styles.scorePill}>{student.desempenoAudio}% audio</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
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
  refreshBtn: {
    padding: "10px 18px",
    backgroundColor: "#f0f7f2",
    color: "#2e7d48",
    border: "1px solid #c8e6d0",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
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
  },
  challengeText: {
    fontSize: "12px",
    color: "#1e293b",
    fontStyle: "italic",
    margin: "2px 0 0 0",
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
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "2px 6px",
    borderRadius: "6px",
  },
}
