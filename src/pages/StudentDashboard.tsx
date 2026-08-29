import { useState } from "react"
import type { User } from "../App"
import StudentCourses from "../components/student/StudentCourses"
import StudentRecordedSessions from "../components/student/StudentRecordedSessions"
import StudentPeerSessions from "../components/student/StudentPeerSessions"
import StudentStats from "../components/student/StudentStats"
import StudentAchievements from "../components/student/StudentAchievements"
import UserProfile from "../components/common/UserProfile"

interface StudentDashboardProps {
  user: User
  onLogout: () => void
  onUpdateUser: (user: User) => void
}

type StudentTab = "inicio" | "cursos" | "grabaciones" | "peer" | "estadisticas" | "logros" | "perfil"

export default function StudentDashboard({ user, onLogout, onUpdateUser }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<StudentTab>("inicio")

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
            <span style={styles.brandSub}>Portal del Estudiante</span>
          </div>
        </div>

        {/* User Identity & Actions */}
        <div style={styles.userSection}>
          <div style={styles.userBadge}>
            <span style={styles.userAvatar}>👨‍🎓</span>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user.nombre}</span>
              <span style={styles.userRoleTag}>Estudiante</span>
            </div>
          </div>

          <button onClick={onLogout} style={styles.logoutBtn}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar + Content */}
      <div style={styles.layoutBody}>
        {/* Student Sidebar Menu (Requirement 8) */}
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
              onClick={() => setActiveTab("peer")}
              style={{
                ...styles.navItem,
                ...(activeTab === "peer" ? styles.activeNavItem : {}),
              }}
            >
              <span style={styles.navIcon}>🤝</span>
              <span>Mis sesiones Peer</span>
            </button>

            <button
              onClick={() => setActiveTab("estadisticas")}
              style={{
                ...styles.navItem,
                ...(activeTab === "estadisticas" ? styles.activeNavItem : {}),
              }}
            >
              <span style={styles.navIcon}>📊</span>
              <span>Mis estadísticas</span>
            </button>

            <button
              onClick={() => setActiveTab("logros")}
              style={{
                ...styles.navItem,
                ...(activeTab === "logros" ? styles.activeNavItem : {}),
              }}
            >
              <span style={styles.navIcon}>🏆</span>
              <span>Mis logros</span>
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

          <div style={styles.sidebarFooter}>
            <div style={styles.streakBox}>
              <span style={styles.streakIcon}>🔥</span>
              <div>
                <span style={styles.streakTitle}>Racha: 7 Días</span>
                <span style={styles.streakSub}>¡Mantén tu constancia!</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={styles.mainContent}>
          {activeTab === "inicio" && (
            <div style={styles.tabContainer}>
              {/* Welcome Banner */}
              <section style={styles.welcomeBanner}>
                <div>
                  <h2 style={styles.welcomeTitle}>¡Hola de nuevo, {user.nombre}! 👋</h2>
                  <p style={styles.welcomeSubtitle}>
                    Continúa aprendiendo a tu ritmo con tus docentes y compañeros Peer
                  </p>
                </div>
                <div style={styles.badgeStudentPill}>
                  <span>👨‍🎓 Cuenta Estudiante</span>
                </div>
              </section>

              {/* Quick Actions Grid */}
              <div style={styles.quickGrid}>
                <div style={styles.quickCard} onClick={() => setActiveTab("peer")}>
                  <div style={styles.quickIcon}>🤝</div>
                  <h3 style={styles.quickTitle}>Mis Sesiones Peer</h3>
                  <p style={styles.quickDesc}>
                    Conéctate con tus compañeros para resolver dudas y aprender en grupo.
                  </p>
                  <span style={styles.quickLink}>Ir a Sesiones Peer →</span>
                </div>

                <div style={styles.quickCard} onClick={() => setActiveTab("grabaciones")}>
                  <div style={styles.quickIcon}>🎥</div>
                  <h3 style={styles.quickTitle}>Sesiones Grabadas</h3>
                  <p style={styles.quickDesc}>
                    Repasa las grabaciones subidas por tus docentes cuando lo necesites.
                  </p>
                  <span style={styles.quickLink}>Ver Grabaciones →</span>
                </div>

                <div style={styles.quickCard} onClick={() => setActiveTab("cursos")}>
                  <div style={styles.quickIcon}>📚</div>
                  <h3 style={styles.quickTitle}>Mis Cursos</h3>
                  <p style={styles.quickDesc}>
                    Revisa las tareas, calificaciones y avance de tus cursos activos.
                  </p>
                  <span style={styles.quickLink}>Ver Cursos →</span>
                </div>
              </div>

              {/* Recent Courses Preview */}
              <StudentCourses />
            </div>
          )}

          {activeTab === "cursos" && <StudentCourses />}

          {activeTab === "grabaciones" && <StudentRecordedSessions />}

          {activeTab === "peer" && <StudentPeerSessions />}

          {activeTab === "estadisticas" && <StudentStats />}

          {activeTab === "logros" && <StudentAchievements />}

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
    color: "#0284c7",
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
    backgroundColor: "#e0f2fe",
    borderRadius: "12px",
    border: "1px solid #bae6fd",
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
    color: "#0369a1",
  },
  userRoleTag: {
    fontSize: "11px",
    color: "#0284c7",
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
    justifyContent: "space-between",
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
    transition: "all 0.2s ease",
  },
  activeNavItem: {
    backgroundColor: "#e0f2fe",
    color: "#0284c7",
    fontWeight: 700,
  },
  navIcon: {
    fontSize: "16px",
  },
  sidebarFooter: {
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },
  streakBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    backgroundColor: "#fef3c7",
    borderRadius: "12px",
    border: "1px solid #fde68a",
  },
  streakIcon: {
    fontSize: "20px",
  },
  streakTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#92400e",
    display: "block",
  },
  streakSub: {
    fontSize: "10px",
    color: "#b45309",
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
  welcomeBanner: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px 32px",
    border: "1px solid #eef2ef",
    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.04)",
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
  badgeStudentPill: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#0284c7",
    backgroundColor: "#e0f2fe",
    padding: "6px 14px",
    borderRadius: "20px",
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  quickCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid #eef2ef",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  quickIcon: {
    fontSize: "28px",
    padding: "10px",
    backgroundColor: "#f7f9f7",
    borderRadius: "12px",
    width: "fit-content",
  },
  quickTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  quickDesc: {
    fontSize: "12px",
    color: "#64748b",
    lineHeight: 1.4,
    margin: 0,
  },
  quickLink: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#0284c7",
    marginTop: "auto",
    paddingTop: "8px",
  },
}
