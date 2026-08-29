import { useState } from "react"
import { useAuthActions } from "@convex-dev/auth/react"

type Modo = "signIn" | "signUp"

/**
 * Ingreso con email y contraseña.
 *
 * Antes alcanzaba con escribir un email existente para entrar como esa
 * persona. Ahora la credencial la verifica el servidor.
 *
 * El registro no crea el perfil: eso se hace desde Gestión Académica. Alguien
 * que se registre con un email no dado de alta entra sin rol y no puede operar,
 * lo que evita que cualquiera se autoasigne permisos.
 */
export default function Login() {
  const { signIn } = useAuthActions()

  const [modo, setModo] = useState<Modo>("signIn")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      setError("Completá el correo y la contraseña.")
      return
    }

    // El proveedor exige 8 caracteres. Avisarlo acá evita un error del
    // servidor que llega sin explicar qué le faltó a la contraseña.
    if (modo === "signUp" && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    setLoading(true)
    setError("")
    try {
      await signIn("password", { email: email.trim(), password, flow: modo })
    } catch (err) {
      console.error("Error de autenticación:", err)
      // El servidor no distingue "no existe" de "contraseña incorrecta", y está
      // bien: decir cuál de las dos falló revela qué correos están registrados.
      setError(
        modo === "signIn"
          ? "Correo o contraseña incorrectos."
          : "No se pudo crear la cuenta. Puede que ese correo ya esté registrado."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
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

        <p style={styles.subtitle}>
          {modo === "signIn"
            ? "Ingresá con tu correo y contraseña"
            : "Creá tu contraseña para acceder"}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="login-email" style={styles.label}>
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@koeduko.com"
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="login-password" style={styles.label}>
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={modo === "signUp" ? "Mínimo 8 caracteres" : "••••••••"}
              style={styles.input}
              autoComplete={modo === "signIn" ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️ {error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span style={styles.btnContent}>
                <span style={styles.spinner} />
                {modo === "signIn" ? "Entrando..." : "Creando cuenta..."}
              </span>
            ) : modo === "signIn" ? (
              "Iniciar Sesión"
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        <div style={styles.switchSection}>
          <p style={styles.switchText}>
            {modo === "signIn"
              ? "¿Primera vez? Si ya te registraron en KoEduko, creá tu contraseña con el mismo correo."
              : "¿Ya tenés contraseña?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setModo((m) => (m === "signIn" ? "signUp" : "signIn"))
              setError("")
            }}
            style={styles.switchBtn}
          >
            {modo === "signIn" ? "Crear mi contraseña" : "Volver a iniciar sesión"}
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
  switchSection: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
    width: "100%",
    textAlign: "center" as const,
  },
  switchText: {
    fontSize: "12px",
    color: "#64748b",
    margin: "0 0 10px 0",
    lineHeight: 1.5,
  },
  switchBtn: {
    padding: "10px 18px",
    backgroundColor: "#f0f7f2",
    color: "#2e7d48",
    border: "1px solid #c8e6d0",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
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