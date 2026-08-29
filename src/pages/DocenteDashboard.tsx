import { useState } from "react"
import type { User } from "../App"
import DocenteModule from "./DocenteModule"
import UserProfile from "../components/common/UserProfile"
import { SessionLiveView } from "../components/SessionLiveView"
import { startSession, stopSession } from "../lib/vapi"
import DocenteStats from "../components/teacher/DocenteStats"
import DocenteRecordings from "../components/teacher/DocenteRecordings"
import DocenteCourses from "../components/teacher/DocenteCourses"

interface DocenteDashboardProps {
  user: User
  onLogout: () => void
  onUpdateUser: (user: User) => void
}

type DocenteTab = "inicio" | "cursos" | "grabaciones" | "sesiones" | "estadisticas" | "estudiantes" | "perfil"

export default function DocenteDashboard({ user, onLogout, onUpdateUser }: DocenteDashboardProps) {
  const [activeTab, setActiveTab] = useState<DocenteTab>("inicio")
  const [isVapiActive, setIsVapiActive] = useState(false)
  const [sessionIds, setSessionIds] = useState({ session: "", vapi: "" })

  const handleStartLiveSession = async () => {
    try {
      const mockSessionId = `session-${Date.now()}`
      const mockVapiId = `vapi-${Date.now()}`

      await startSession(mockSessionId, user.nombre)
      setSessionIds({ session: mockSessionId, vapi: mockVapiId })
      setIsVapiActive(true)
    } catch (err) {
      console.warn("Vapi connection fallback mode:", err)
      setIsVapiActive(true)
    }
  }

  const handleStopLiveSession = () => {
    stopSession()
    setIsVapiActive(false)
  }

  return (
    <div style={styles.container}>
      {/* Top Navbar */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.logoIcon}>
            <img src="/logEddukko-solo.png" alt="KoEduko" style={styles.logoImg} />
          </div>
          <div>
            <h1 style={styles.brandTitle}>KoEduko</h1>
            <span style={styles.brandSub}>Portal Docente</span>
          </div>
        </div>

        {/* User Identity & Logout */}
        <div style={styles.userSection}>
          <div style={styles.userBadge}>
            <span style={styles.userAvatar}>👨‍🏫</span>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user.nombre}</span>
              <span style={styles.userRoleTag}>Docente Instructor</span>
            </div>
          </div>

          <button onClick={onLogout} style={styles.logoutBtn}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div style={styles.layoutBody}>
        {/* Docente Sidebar Menu (Requirement 7) */}
        <aside style={styles.sidebar}>
          <nav style={styles.sidebarNav}>
            <button
              onClick={() => setActiveTab("inicio")}
              style={{
                ...styles.navItem,
                ...(activeTab === "inicio" ? styles.activeNavItem : {}),
              }}
            >
              <span style={styles.navIcon}>🏠</span>
              <span>Inicio</span>
            </button>

            <button
              onClick={() => setActiveTab("cursos")}
              style={{
                ...styles.navItem,
                ...(activeTab === "cursos" ? styles.activeNavItem : {}),
              }}
            >
              <span style={styles.navIcon}>📚</span>
              <span>Mis cursos</span>
            </button>

            <button
              onClick={() => setActiveTab("grabaciones")}
              style={{
                ...styles.navItem,
                ...(activeTab === "grabaciones" ? styles.activeNavItem : {}),
              }}
            >
              <span style={styles.navIcon}>🎥</span>
              <span>Sesiones grabadas</span>
            </button>

            <button
              onClick={() => setActiveTab("sesiones")}
              style={{
                ...styles.navItem,
                ...(activeTab === "sesiones" ? styles.activeNavItem : {}),
              }}
            >
              <span style={styles.navIcon}>🗓️</span>
              <span>Sesiones y Aula</span>
            </button>

            <button
              onClick={() => setActiveTab("estadisticas")}
              style={{
                ...styles.navItem,
                ...(activeTab === "estadisticas" ? styles.activeNavItem : {}),
              }}
            >
              <span style={styles.navIcon}>📊</span>
              <span>Estadísticas</span>
            </button>

            <button
              onClick={() => setActiveTab("estudiantes")}
              style={{
                ...styles.navItem,
                ...(activeTab === "estudiantes" ? styles.activeNavItem : {}),
              }}
            >
              <span style={styles.navIcon}>👥</span>
              <span>Estudiantes</span>
            </button>

            <button
              onClick={() => setActiveTab("perfil")}
              style={{
                ...styles.navItem,
                ...(activeTab === "perfil" ? styles.activeNavItem : {}),
              }}
            >
              <span style={styles.navIcon}>👤</span>
              <span>Mi perfil</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main style={styles.mainContent}>
          {activeTab === "inicio" && (
            <div style={styles.tabContainer}>
              {/* Welcome Banner */}
              <section style={styles.welcomeBanner}>
                <div>
                  <h2 style={styles.welcomeTitle}>¡Bienvenido, {user.nombre}! 👨‍🏫</h2>
                  <p style={styles.welcomeSubtitle}>
                    Panel de control docente para crear sesiones, escuchar aulas y agrupar alumnos
                  </p>
                </div>

                <div style={styles.statusPill}>
                  <span style={styles.pulseDot} />
                  <span>Modo Docente Activo</span>
                </div>
              </section>

              {/* Vapi Live Session Controller (Exclusivo Docente) */}
              <section style={styles.vapiControlCard}>
                <div style={styles.vapiControlLeft}>
                  <div style={styles.vapiIcon}>🎙️</div>
                  <div>
                    <h3 style={styles.vapiTitle}>Grabación y Asistente IA de Aula en Vivo</h3>
                    <p style={styles.vapiDesc}>
                      {isVapiActive
                        ? "Escuchando interacciones del aula en vivo con Vapi..."
                        : "Inicia la sesión con Vapi para grabar y analizar la clase en tiempo real."}
                    </p>
                  </div>
                </div>

                <div style={styles.vapiActions}>
                  {!isVapiActive ? (
                    <button onClick={handleStartLiveSession} style={styles.startVapiBtn}>
                      🎙️ Iniciar Grabación de Sesión
                    </button>
                  ) : (
                    <button onClick={handleStopLiveSession} style={styles.stopVapiBtn}>
                      ⏹️ Detener Grabación
                    </button>
                  )}
                </div>
              </section>

              {/* Render Vapi Live View if active */}
              {isVapiActive && (
                <SessionLiveView
                  sessionId={sessionIds.session}
                  vapiSessionId={sessionIds.vapi}
                />
              )}

              {/* Summary Stats Grid */}
              <section style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <span style={styles.statIcon}>📚</span>
                  <div>
                    <span style={styles.statNumber}>3</span>
                    <span style={styles.statLabel}>Cursos Asignados</span>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <span style={styles.statIcon}>👥</span>
                  <div>
                    <span style={styles.statNumber}>48</span>
                    <span style={styles.statLabel}>Estudiantes Totales</span>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <span style={styles.statIcon}>🎙️</span>
                  <div>
                    <span style={styles.statNumber}>14</span>
                    <span style={styles.statLabel}>Sesiones Grabadas</span>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <span style={styles.statIcon}>📈</span>
                  <div>
                    <span style={styles.statNumber}>88%</span>
                    <span style={styles.statLabel}>Participación Promedio</span>
                  </div>
                </div>
              </section>

              {/* Access to Classroom Studio Module */}
              <section style={styles.calloutCard}>
                <div>
                  <h3 style={styles.calloutTitle}>🛠️ Asistente de Aula & Planificación en PDF</h3>
                  <p style={styles.calloutSub}>
                    Graba tu voz, responde preguntas guía, genera tu Plan de Sesión en PDF y organiza agrupaciones Peer.
                  </p>
                </div>
                <button onClick={() => setActiveTab("sesiones")} style={styles.openModuleBtn}>
                  Abrir Módulo de Aula →
                </button>
              </section>
            </div>
          )}

          {activeTab === "cursos" && <DocenteCourses />}

          {activeTab === "grabaciones" && <DocenteRecordings />}

          {/* Sesiones y Aula -> Render full DocenteModule */}
          {activeTab === "sesiones" && <DocenteModule />}

          {activeTab === "estadisticas" && <DocenteStats />}

          {activeTab === "estudiantes" && (
            <div style={styles.tabContainer}>
              <h2 style={styles.sectionTitle}>👥 Lista de Estudiantes Inscritos</h2>
              <div style={styles.studentsTableBox}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Estudiante</th>
                      <th style={styles.th}>Carrera</th>
                      <th style={styles.th}>Asistencia</th>
                      <th style={styles.th}>Participación</th>
                      <th style={styles.th}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.td}>Estudiante Carlos</td>
                      <td style={styles.td}>Ingeniería de Software</td>
                      <td style={styles.td}>95%</td>
                      <td style={styles.td}>92%</td>
                      <td style={styles.td}><span style={styles.pillGreen}>Excelente</span></td>
                    </tr>
                    <tr>
                      <td style={styles.td}>Lucía Fernández</td>
                      <td style={styles.td}>Diseño Digital</td>
                      <td style={styles.td}>88%</td>
                      <td style={styles.td}>64%</td>
                      <td style={styles.td}><span style={styles.pillYellow}>Refuerzo Recomendado</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "perfil" && <UserProfile user={user} onUpdateUser={onUpdateUser} />}
        </main>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f7f9f7",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    height: "72px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #eef2ef",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    backgroundColor: "#f0f7f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    border: "1px solid #e1efe5",
  },
  logoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  brandTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1e293b",
    margin: 0,
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: "12px",
    color: "#2e7d48",
    fontWeight: 600,
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 14px",
    backgroundColor: "#eaf5ed",
    borderRadius: "12px",
    border: "1px solid #c8e6d0",
  },
  userAvatar: {
    fontSize: "18px",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#2e7d48",
  },
  userRoleTag: {
    fontSize: "11px",
    color: "#1e293b",
    fontWeight: 600,
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    border: "1px solid #fee2e2",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
  },
  layoutBody: {
    display: "flex",
    flex: 1,
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
  },
  sidebar: {
    width: "240px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #eef2ef",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  sidebarNav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "transparent",
    color: "#64748b",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "left" as const,
    cursor: "pointer",
  },
  activeNavItem: {
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    fontWeight: 700,
  },
  navIcon: {
    fontSize: "16px",
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    overflowY: "auto" as const,
  },
  tabContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1e293b",
    margin: 0,
  },
  welcomeBanner: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px 32px",
    border: "1px solid #eef2ef",
    boxShadow: "0 4px 12px rgba(46, 125, 72, 0.04)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  welcomeSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 14px",
    backgroundColor: "#eaf5ed",
    color: "#2e7d48",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2e7d48",
  },
  vapiControlCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "2px solid #b8e2c4",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 4px 16px rgba(46, 125, 72, 0.08)",
  },
  vapiControlLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  vapiIcon: {
    fontSize: "32px",
    padding: "12px",
    backgroundColor: "#eaf5ed",
    borderRadius: "16px",
  },
  vapiTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  vapiDesc: {
    fontSize: "13px",
    color: "#475569",
    margin: 0,
  },
  vapiActions: {
    display: "flex",
  },
  startVapiBtn: {
    padding: "12px 24px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  stopVapiBtn: {
    padding: "12px 24px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid #eef2ef",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  statIcon: {
    fontSize: "24px",
    padding: "10px",
    backgroundColor: "#f7f9f7",
    borderRadius: "12px",
  },
  statNumber: {
    display: "block",
    fontSize: "22px",
    fontWeight: 800,
    color: "#1e293b",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
  },
  calloutCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #eef2ef",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calloutTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  calloutSub: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  openModuleBtn: {
    padding: "12px 20px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  coursesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  courseCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #eef2ef",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  courseCode: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#2e7d48",
    backgroundColor: "#eaf5ed",
    padding: "4px 8px",
    borderRadius: "6px",
    width: "fit-content",
  },
  courseName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  courseDesc: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  courseBtn: {
    marginTop: "12px",
    padding: "10px",
    backgroundColor: "#f8faf8",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
  },
  recordingsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  recItem: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid #eef2ef",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  recMeta: {
    fontSize: "12px",
    color: "#64748b",
  },
  recActions: {
    display: "flex",
    gap: "10px",
  },
  playRecBtn: {
    padding: "8px 14px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
  },
  infoRecBtn: {
    padding: "8px 14px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
  },
  statsGridBig: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  statBigTile: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #eef2ef",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statBigTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#64748b",
  },
  statBigVal: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#1e293b",
  },
  studentsTableBox: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid #eef2ef",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "13px",
  },
  th: {
    textAlign: "left" as const,
    padding: "12px",
    borderBottom: "2px solid #f1f5f9",
    color: "#64748b",
    fontWeight: 700,
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #f1f5f9",
    color: "#1e293b",
  },
  pillGreen: {
    backgroundColor: "#eaf5ed",
    color: "#2e7d48",
    padding: "4px 8px",
    borderRadius: "6px",
    fontWeight: 700,
    fontSize: "11px",
  },
  pillYellow: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "4px 8px",
    borderRadius: "6px",
    fontWeight: 700,
    fontSize: "11px",
  },
}
