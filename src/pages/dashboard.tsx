import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { User } from "../App"
import DocenteModule from "./DocenteModule"
import { SessionLiveView } from "../components/SessionLiveView"
import { startSession, stopSession } from "../lib/vapi"

interface DashboardProps {
  user: User
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [showDocenteModule, setShowDocenteModule] = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionIds, setSessionIds] = useState({ session: "", vapi: "" })

  const roles = useQuery(api.roles.listar)
  const usuarios = useQuery(api.usuario.listar)
  const cursos = useQuery(api.curso.listar)
  const instruccion = useQuery(api.instruccion.listar)

  if (showDocenteModule) {
    return <DocenteModule onBackToDashboard={() => setShowDocenteModule(false)} />
  }

  return (
    <div style={styles.container}>
      {/* Header Bar */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.logoIcon}>
            <img src="/logEddukko-solo.png" alt="KoEduko" style={styles.logoImg} />
          </div>
          <div>
            <h1 style={styles.brandTitle}>KoEduko</h1>
            <span style={styles.brandSub}>Panel Principal</span>
          </div>
        </div>

        <div style={styles.userSection}>
          <div style={styles.userBadge}>
            <span style={styles.userAvatar}>{user.nombre.charAt(0).toUpperCase()}</span>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user.nombre}</span>
              <span style={styles.userEmail}>{user.email}</span>
            </div>
          </div>

          <button onClick={onLogout} style={styles.logoutBtn}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Welcome Banner */}
        <section style={styles.welcomeBanner}>
          <div>
            <h2 style={styles.welcomeTitle}>¡Hola de nuevo, {user.nombre}! 👋</h2>
            <p style={styles.welcomeSubtitle}>
              Conectado en tiempo real a la base de datos de Convex
            </p>
          </div>
          <div style={styles.statusPill}>
            <span style={styles.pulseDot} />
            <span>Sistema en línea</span>
          </div>
        </section>

        {/* Vapi Live Session Module */}
        <section style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Sesión Educativa en Vivo (Voz AI)</h3>
            <p style={styles.cardDesc}>Prueba de conexión con Vapi y Claude</p>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <button 
              onClick={async () => {
                await startSession("session-123", user.nombre);
                setSessionActive(true);
                setSessionIds({ session: "session-123", vapi: "vapi-session-123" });
              }}
              style={styles.calloutBtn}
            >
              🎙️ Iniciar Llamada Vapi
            </button>
            {sessionActive && (
              <button 
                onClick={() => {
                  stopSession();
                  setSessionActive(false);
                }}
                style={{ ...styles.calloutBtn, backgroundColor: "#dc2626" }}
              >
                ⏹️ Detener
              </button>
            )}
          </div>

          {sessionActive && (
            <SessionLiveView
              vapiSessionId={sessionIds.vapi}
              sessionId={sessionIds.session}
            />
          )}
        </section>

        {/* Teacher Module Callout Card */}
        <section style={styles.docenteCalloutCard}>
          <div style={styles.calloutLeft}>
            <div style={styles.calloutIcon}>👨‍🏫</div>
            <div>
              <h3 style={styles.calloutTitle}>Módulo del Docente</h3>
              <p style={styles.calloutDesc}>
                Escucha el salón de clases, analiza la participación, genera el Plan de Sesión en PDF y agrupa estudiantes según su rendimiento.
              </p>
            </div>
          </div>
          <button onClick={() => setShowDocenteModule(true)} style={styles.calloutBtn}>
            🚀 Abrir Módulo Docente →
          </button>
        </section>

        {/* Quick Stats Grid */}
        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>👥</span>
            <div>
              <span style={styles.statNumber}>{usuarios ? usuarios.length : 0}</span>
              <span style={styles.statLabel}>Usuarios</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📚</span>
            <div>
              <span style={styles.statNumber}>{cursos ? cursos.length : 0}</span>
              <span style={styles.statLabel}>Cursos</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🎓</span>
            <div>
              <span style={styles.statNumber}>{instruccion ? instruccion.length : 0}</span>
              <span style={styles.statLabel}>Niveles Instrucción</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🛡️</span>
            <div>
              <span style={styles.statNumber}>{roles ? roles.length : 0}</span>
              <span style={styles.statLabel}>Roles Asignados</span>
            </div>
          </div>
        </section>

        {/* Roles List */}
        <section style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Roles de Usuario</h3>
              <p style={styles.cardDesc}>Permisos y jerarquía configurada en Convex</p>
            </div>
          </div>

          {!roles ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
              <span>Cargando roles en tiempo real...</span>
            </div>
          ) : roles.length === 0 ? (
            <div style={styles.emptyBox}>
              <p>No hay roles registrados aún en la base de datos.</p>
            </div>
          ) : (
            <div style={styles.rolesGrid}>
              {roles.map((rol) => (
                <div key={rol._id} style={styles.roleTile}>
                  <div style={styles.roleTileHeader}>
                    <span style={styles.roleBadge}>{rol.nombre}</span>
                  </div>
                  <p style={styles.roleDesc}>{rol.desc}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
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
    color: "#64748b",
    fontWeight: 500,
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
    padding: "6px 12px",
    backgroundColor: "#f8faf8",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#1e293b",
  },
  userEmail: {
    fontSize: "11px",
    color: "#64748b",
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    border: "1px solid #fee2e2",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  mainContent: {
    maxWidth: "1100px",
    width: "100%",
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
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
    fontWeight: 700,
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
    fontSize: "13px",
    fontWeight: 600,
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2e7d48",
    display: "inline-block",
  },
  docenteCalloutCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px 32px",
    border: "2px solid #b8e2c4",
    boxShadow: "0 8px 24px -6px rgba(46, 125, 72, 0.12)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  calloutLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    maxWidth: "680px",
  },
  calloutIcon: {
    fontSize: "36px",
    padding: "12px",
    backgroundColor: "#eaf5ed",
    borderRadius: "16px",
  },
  calloutTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  calloutDesc: {
    fontSize: "13px",
    color: "#475569",
    margin: 0,
    lineHeight: 1.5,
  },
  calloutBtn: {
    padding: "12px 24px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 4px 14px rgba(46, 125, 72, 0.25)",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid #eef2ef",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  statIcon: {
    fontSize: "28px",
    padding: "12px",
    backgroundColor: "#f7f9f7",
    borderRadius: "14px",
  },
  statNumber: {
    display: "block",
    fontSize: "22px",
    fontWeight: 800,
    color: "#1e293b",
  },
  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 500,
  },
  contentCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    border: "1px solid #eef2ef",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
  },
  cardHeader: {
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  cardDesc: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  rolesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  roleTile: {
    padding: "18px",
    backgroundColor: "#f8faf8",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
  },
  roleTileHeader: {
    marginBottom: "8px",
  },
  roleBadge: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#2e7d48",
    textTransform: "capitalize" as const,
  },
  roleDesc: {
    fontSize: "13px",
    color: "#475569",
    margin: 0,
    lineHeight: 1.5,
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
  },
  emptyBox: {
    padding: "32px",
    textAlign: "center" as const,
    color: "#94a3b8",
  },
}