export interface Achievement {
  id: string
  titulo: string
  descripcion: string
  icono: string
  categoria: string
  desbloqueado: boolean
  fecha?: string
}

const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: "a1",
    titulo: "Pionero Peer Learning",
    descripcion: "Completaste tu primera sesión de aprendizaje entre pares.",
    icono: "🤝",
    categoria: "Colaboración",
    desbloqueado: true,
    fecha: "20 de agosto, 2026",
  },
  {
    id: "a2",
    titulo: "Constancia de Hierro",
    descripcion: "Mantuviste una racha de 7 días consecutivos aprendiendo.",
    icono: "🔥",
    categoria: "Hábitos",
    desbloqueado: true,
    fecha: "28 de agosto, 2026",
  },
  {
    id: "a3",
    titulo: "Oyente Atento",
    descripcion: "Reprodujiste y revisaste 10 sesiones grabadas por tu docente.",
    icono: "🎧",
    categoria: "Estudio",
    desbloqueado: true,
    fecha: "25 de agosto, 2026",
  },
  {
    id: "a4",
    titulo: "Mentor Colaborativo",
    descripcion: "Ayudaste a 3 compañeros de refuerzo en una sesión Peer.",
    icono: "🌟",
    categoria: "Mentoría",
    desbloqueado: false,
  },
  {
    id: "a5",
    titulo: "Maestro del Código",
    descripcion: "Obtuviste 20 puntos perfectos en tu rúbrica de práctica.",
    icono: "🏆",
    categoria: "Excelencia",
    desbloqueado: false,
  },
]

export default function StudentAchievements() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🏆 Mis Logros e Insignias</h2>
          <p style={styles.subtitle}>
            Reconocimientos obtenidos por tu dedicación, racha y aprendizaje entre pares
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        {ACHIEVEMENTS_LIST.map((badge) => (
          <div
            key={badge.id}
            style={{
              ...styles.card,
              opacity: badge.desbloqueado ? 1 : 0.6,
              filter: badge.desbloqueado ? "none" : "grayscale(0.6)",
            }}
          >
            <div style={styles.badgeHeader}>
              <div style={styles.iconCircle}>{badge.icono}</div>
              <span
                style={{
                  ...styles.categoryTag,
                  backgroundColor: badge.desbloqueado ? "#eaf5ed" : "#f1f5f9",
                  color: badge.desbloqueado ? "#2e7d48" : "#64748b",
                }}
              >
                {badge.categoria}
              </span>
            </div>

            <h3 style={styles.badgeTitle}>{badge.titulo}</h3>
            <p style={styles.badgeDesc}>{badge.descripcion}</p>

            <div style={styles.badgeFooter}>
              {badge.desbloqueado ? (
                <span style={styles.unlockedText}>✅ Desbloqueado el {badge.fecha}</span>
              ) : (
                <span style={styles.lockedText}>🔒 En progreso...</span>
              )}
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
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #eef2ef",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.03)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  badgeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    backgroundColor: "#f7f9f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    border: "1px solid #e2e8f0",
  },
  categoryTag: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "8px",
  },
  badgeTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  badgeDesc: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.4,
    margin: 0,
  },
  badgeFooter: {
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
  },
  unlockedText: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#2e7d48",
  },
  lockedText: {
    fontSize: "11px",
    color: "#94a3b8",
  },
}
