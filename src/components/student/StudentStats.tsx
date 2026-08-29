export default function StudentStats() {
  const statsData = {
    progresoGeneral: 78,
    cursosCompletados: 2,
    cursosActivos: 3,
    promedioNotas: 17.5,
    sesionesPeerRealizadas: 8,
    sesionesGrabadasVistas: 12,
    horasAprendizaje: 28,
    rachaDias: 7,
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📊 Mis Estadísticas de Aprendizaje</h2>
          <p style={styles.subtitle}>
            Monitorea tu rendimiento académico, racha de estudio y participación Peer
          </p>
        </div>
      </div>

      {/* Primary Highlights Grid */}
      <div style={styles.primaryGrid}>
        <div style={styles.statCardHighlight}>
          <div style={styles.statIconBadge}>📈</div>
          <div>
            <span style={styles.statLabel}>Progreso General</span>
            <span style={styles.statValueHighlight}>{statsData.progresoGeneral}%</span>
            <span style={styles.statSub}>+12% respecto a la semana pasada</span>
          </div>
        </div>

        <div style={styles.statCardHighlight}>
          <div style={{ ...styles.statIconBadge, backgroundColor: "#fef3c7" }}>🔥</div>
          <div>
            <span style={styles.statLabel}>Racha de Aprendizaje</span>
            <span style={{ ...styles.statValueHighlight, color: "#d97706" }}>
              {statsData.rachaDias} días seguidos
            </span>
            <span style={styles.statSub}>¡Sigue manteniendo tu hábito diario!</span>
          </div>
        </div>

        <div style={styles.statCardHighlight}>
          <div style={{ ...styles.statIconBadge, backgroundColor: "#e0f2fe" }}>📝</div>
          <div>
            <span style={styles.statLabel}>Promedio de Calificaciones</span>
            <span style={{ ...styles.statValueHighlight, color: "#0284c7" }}>
              {statsData.promedioNotas} / 20
            </span>
            <span style={styles.statSub}>Excelente desempeño académico</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div style={styles.secondaryGrid}>
        <div style={styles.metricTile}>
          <span style={styles.metricIcon}>🎓</span>
          <div style={styles.metricInfo}>
            <span style={styles.metricVal}>{statsData.cursosCompletados}</span>
            <span style={styles.metricName}>Cursos Completados</span>
          </div>
        </div>

        <div style={styles.metricTile}>
          <span style={styles.metricIcon}>📚</span>
          <div style={styles.metricInfo}>
            <span style={styles.metricVal}>{statsData.cursosActivos}</span>
            <span style={styles.metricName}>Cursos Activos</span>
          </div>
        </div>

        <div style={styles.metricTile}>
          <span style={styles.metricIcon}>🤝</span>
          <div style={styles.metricInfo}>
            <span style={styles.metricVal}>{statsData.sesionesPeerRealizadas}</span>
            <span style={styles.metricName}>Sesiones Peer Realizadas</span>
          </div>
        </div>

        <div style={styles.metricTile}>
          <span style={styles.metricIcon}>🎥</span>
          <div style={styles.metricInfo}>
            <span style={styles.metricVal}>{statsData.sesionesGrabadasVistas}</span>
            <span style={styles.metricName}>Sesiones Grabadas Vistas</span>
          </div>
        </div>

        <div style={styles.metricTile}>
          <span style={styles.metricIcon}>⏱️</span>
          <div style={styles.metricInfo}>
            <span style={styles.metricVal}>{statsData.horasAprendizaje} hrs</span>
            <span style={styles.metricName}>Tiempo de Aprendizaje</span>
          </div>
        </div>
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
  primaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  statCardHighlight: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #eef2ef",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.03)",
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  statIconBadge: {
    width: "54px",
    height: "54px",
    borderRadius: "16px",
    backgroundColor: "#eaf5ed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    flexShrink: 0,
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    display: "block",
  },
  statValueHighlight: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#2e7d48",
    display: "block",
    margin: "2px 0",
  },
  statSub: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  secondaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
  metricTile: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "18px 20px",
    border: "1px solid #eef2ef",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  metricIcon: {
    fontSize: "24px",
    padding: "10px",
    backgroundColor: "#f7f9f7",
    borderRadius: "12px",
  },
  metricInfo: {
    display: "flex",
    flexDirection: "column",
  },
  metricVal: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#1e293b",
  },
  metricName: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 500,
  },
}
