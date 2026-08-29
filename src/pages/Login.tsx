import { useState } from "react"
import { useConvex, useQuery } from "convex/react"
import { api } from "@convex/_generated/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const convex = useConvex()
  const users = useQuery(api.usuario.listar)

  const handleLogin = async (targetEmail?: string) => {
    const emailToSubmit = targetEmail || email
    if (!emailToSubmit.trim()) {
      setError("Por favor ingresa tu correo electrónico")
      return
    }
    setLoading(true)
    setError("")
    try {
      const user = await convex.query(api.auth.login, { email: emailToSubmit.trim() })
      if (user) {
        localStorage.setItem("koeduko_user", JSON.stringify(user))
        window.location.href = "/"
      } else {
        setError("Correo no registrado. Selecciona o escribe un correo de ejemplo.")
      }
    } catch {
      setError("Error al conectar con la base de datos de Convex.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <div style={styles.page}>
      {/* Background subtle ambient shapes */}
      <div style={styles.ambientGlow} />

      <div style={styles.card}>
        <div style={styles.logoWrapper}>
          <div style={styles.logoBadge}>
            <img
              src="/logEddukko-solo.png"
              alt="KoEduko"
              style={styles.logoImg}
            />
          </div>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>KoEduko</h1>
          <span style={styles.tagline}>Aprende sin límites • Peer to Peer</span>
        </div>

        <p style={styles.subtitle}>Ingresa tu correo para acceder al panel</p>

        <div style={styles.formGroup}>
          <label htmlFor="login-email" style={styles.label}>
            Correo electrónico
          </label>
          <div style={styles.inputContainer}>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="ejemplo@koeduko.com"
              style={styles.input}
              autoComplete="email"
            />
          </div>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <button
          onClick={() => handleLogin()}
          disabled={loading}
          style={{
            ...styles.submitBtn,
            opacity: loading ? 0.75 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <span style={styles.btnContent}>
              <span style={styles.spinner} /> Entrando...
            </span>
          ) : (
            "Iniciar Sesión"
          )}
        </button>

        {/* Demo Users Section */}
        {users && users.length > 0 && (
          <div style={styles.demoSection}>
            <p style={styles.demoTitle}>Usuarios registrados en el sistema:</p>
            <div style={styles.demoList}>
              {users.slice(0, 4).map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => {
                    setEmail(u.email)
                    handleLogin(u.email)
                  }}
                  style={styles.demoChip}
                >
                  <span style={styles.demoName}>{u.nombre}</span>
                  <span style={styles.demoEmail}>{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
    maxWidth: "420px",
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
    marginBottom: "20px",
  },
  logoBadge: {
    width: "88px",
    height: "88px",
    borderRadius: "22px",
    backgroundColor: "#f0f7f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
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
    marginBottom: "8px",
  },
  title: {
    fontSize: "28px",
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
    margin: "8px 0 28px 0",
  },
  formGroup: {
    width: "100%",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
    marginBottom: "8px",
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    width: "100%",
    backgroundColor: "#ffffff",
    color: "#1e293b",
    border: "1.5px solid #cbd5e1",
    borderRadius: "12px",
    padding: "14px 16px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box" as const,
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
  submitBtn: {
    width: "100%",
    padding: "14px 20px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 700,
    boxShadow: "0 4px 14px rgba(46, 125, 72, 0.25)",
    transition: "all 0.2s ease",
  },
  btnContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  demoSection: {
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
    width: "100%",
  },
  demoTitle: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    marginBottom: "10px",
    textAlign: "center" as const,
  },
  demoList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  demoChip: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "#f8faf8",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    textAlign: "left" as const,
    width: "100%",
  },
  demoName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#1e293b",
  },
  demoEmail: {
    fontSize: "12px",
    color: "#2e7d48",
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