import { useState } from "react"
import { useConvex } from "convex/react"
import { api } from "@convex/_generated/api"

export default function Login() {
  const [loadingRole, setLoadingRole] = useState<"docente" | "estudiante" | null>(null)
  const [error, setError] = useState("")

  const convex = useConvex()

  const handleRoleLogin = async (role: "docente" | "estudiante") => {
    setLoadingRole(role)
    setError("")

    const targetEmail = role === "docente" ? "ana@koeduko.com" : "carlos@koeduko.com"

    try {
      // Intentar obtener usuario real de Convex por email
      const user = await convex.query(api.auth.login, { email: targetEmail })
      if (user) {
        const enrichedUser = {
          ...user,
          rol: role,
          carrera: user.carrera || (role === "docente" ? "Educación y Computación" : "Ingeniería de Software"),
          institucion: (user as any).institucion || "Universidad Nacional de Ingeniería",
          bio: (user as any).bio || (role === "docente"
            ? "Profesor especialista en Inteligencia Artificial y metodología Peer-to-Peer."
            : "Estudiante de ingeniería enfocado en desarrollo web y aprendizaje colaborativo."),
        }
        localStorage.setItem("koeduko_user", JSON.stringify(enrichedUser))
        window.location.href = "/"
        return
      }
    } catch (err) {
      console.warn("Convex login query failed, utilizing demo user profile:", err)
    }

    // Fallback a perfil demo estándar
    const mockUser = {
      _id: role === "docente" ? "user-docente-demo" : "user-estudiante-demo",
      nombre: role === "docente" ? "Profesor Ana" : "Estudiante Carlos",
      email: targetEmail,
      carrera: role === "docente" ? "Educación & Algoritmos" : "Ingeniería de Software",
      rol: role,
      institucion: "Universidad Nacional de Ingeniería",
      bio: role === "docente"
        ? "Docente titular. Apasionado por la didáctica de la programación y la gestión de sesiones colaborativas."
        : "Estudiante proactivo. Participante activo en redes de aprendizaje entre pares (Peer Learning).",
      avatar: role === "docente" ? "👨‍🏫" : "👨‍🎓",
    }

    localStorage.setItem("koeduko_user", JSON.stringify(mockUser))
    window.location.href = "/"
  }

  return (
    <div style={styles.page}>
      {/* Background subtle ambient shapes */}
      <div style={styles.ambientGlow} />

      <div style={styles.card}>
        <div style={styles.logoWrapper}>
          <div style={styles.logoBadge}>
            <img src="/logEddukko-solo.png" alt="KoEduko" style={styles.logoImg} />
          </div>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>KoEduko</h1>
          <span style={styles.tagline}>Aprende sin límites • Peer to Peer</span>
        </div>

        <p style={styles.subtitle}>¿Cómo quieres ingresar hoy?</p>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Demo Role Selection Cards */}
        <div style={styles.roleGrid}>
          {/* Docente Card */}
          <button
            type="button"
            onClick={() => handleRoleLogin("docente")}
            disabled={loadingRole !== null}
            style={{
              ...styles.roleCard,
              borderColor: loadingRole === "docente" ? "#2e7d48" : "#e2e8f0",
            }}
          >
            <div style={styles.roleIconBadge}>👨‍🏫</div>
            <div style={styles.roleTextContainer}>
              <span style={styles.roleCardTitle}>Ingresar como Docente</span>
              <span style={styles.roleCardSub}>
                Gestiona tus cursos, graba sesiones y agrupa estudiantes
              </span>
            </div>
            <div style={styles.roleArrow}>
              {loadingRole === "docente" ? <span style={styles.spinner} /> : "→"}
            </div>
          </button>

          {/* Estudiante Card */}
          <button
            type="button"
            onClick={() => handleRoleLogin("estudiante")}
            disabled={loadingRole !== null}
            style={{
              ...styles.roleCard,
              borderColor: loadingRole === "estudiante" ? "#0284c7" : "#e2e8f0",
            }}
          >
            <div style={{ ...styles.roleIconBadge, backgroundColor: "#e0f2fe" }}>👨‍🎓</div>
            <div style={styles.roleTextContainer}>
              <span style={{ ...styles.roleCardTitle, color: "#0369a1" }}>
                Ingresar como Estudiante
              </span>
              <span style={styles.roleCardSub}>
                Revisa grabaciones, participa en sesiones Peer y mira tus avances
              </span>
            </div>
            <div style={{ ...styles.roleArrow, color: "#0284c7" }}>
              {loadingRole === "estudiante" ? <span style={styles.spinnerBlue} /> : "→"}
            </div>
          </button>
        </div>
      </div>

      <footer style={styles.pageFooter}>
        <p>© 2026 KoEduko — Plataforma Educativa Peer-to-Peer</p>
      </footer>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f9f7",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
  },
  ambientGlow: {
    position: "absolute",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(46, 125, 72, 0.06) 0%, rgba(247, 249, 247, 0) 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "40px 32px",
    boxShadow: "0 20px 40px -15px rgba(46, 125, 72, 0.07), 0 4px 16px rgba(0, 0, 0, 0.04)",
    border: "1px solid #eef2ef",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 1,
  },
  logoWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
  },
  logoBadge: {
    width: "80px",
    height: "80px",
    borderRadius: "20px",
    backgroundColor: "#f0f7f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    border: "1px solid #e1efe5",
    boxShadow: "0 4px 12px rgba(46, 125, 72, 0.08)",
  },
  logoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "6px",
  },
  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#1e293b",
    letterSpacing: "-0.5px",
    margin: "0 0 4px 0",
  },
  tagline: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#2e7d48",
    backgroundColor: "#eaf5ed",
    padding: "4px 12px",
    borderRadius: "20px",
    display: "inline-block",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center" as const,
    margin: "12px 0 24px 0",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    textAlign: "center" as const,
  },
  roleGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  roleCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px 20px",
    backgroundColor: "#ffffff",
    border: "2px solid #e2e8f0",
    borderRadius: "16px",
    textAlign: "left" as const,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  roleIconBadge: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "#eaf5ed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },
  roleTextContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  roleCardTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#2e7d48",
  },
  roleCardSub: {
    fontSize: "12px",
    color: "#64748b",
    lineHeight: 1.4,
  },
  roleArrow: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#2e7d48",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #2e7d48",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  spinnerBlue: {
    width: "16px",
    height: "16px",
    border: "2px solid #0284c7",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  pageFooter: {
    marginTop: "24px",
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center" as const,
    position: "relative",
    zIndex: 1,
  },
}