import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { api } from "@convex/_generated/api"
import Dashboard from "./pages/dashboard"
import Login from "./pages/Login"
import { ErrorBoundary } from "./components/ErrorBoundary"

interface User {
  _id: string
  nombre: string
  apellido?: string
  email: string
  rol_id?: string
  rol?: string
  carrera?: string
  institucion?: string
  bio?: string
  avatar?: string
}

/**
 * La sesión la resuelve el servidor, no el navegador.
 *
 * Antes el usuario salía de localStorage, así que cualquiera podía escribir
 * una entrada a mano y entrar como quien quisiera. Ahora el estado de sesión
 * viene del token que valida Convex en cada query.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AuthLoading>
        <PantallaCarga texto="Verificando sesión..." />
      </AuthLoading>

      <Unauthenticated>
        <Login />
      </Unauthenticated>

      <Authenticated>
        <AppAutenticada />
      </Authenticated>
    </ErrorBoundary>
  )
}

function AppAutenticada() {
  const usuario = useQuery(api.auth.usuarioActual)
  const { signOut } = useAuthActions()

  if (usuario === undefined) {
    return <PantallaCarga texto="Cargando tu perfil..." />
  }

  // Cuenta creada con un email que nadie dio de alta en la plataforma. Tiene
  // credencial válida pero ningún rol, así que no puede operar: sin rol no se
  // sabe qué permisos tendría.
  if (usuario === null || usuario.sinPerfil) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <span style={styles.icon}>🔒</span>
          <h1 style={styles.title}>Tu cuenta todavía no tiene perfil</h1>
          <p style={styles.desc}>
            Te registraste correctamente, pero el email{" "}
            <strong>{usuario?.email ?? "usado"}</strong> no está dado de alta en
            KoEduko. Pedile a un docente que te registre desde Gestión Académica
            con ese mismo correo.
          </p>
          <button onClick={() => void signOut()} style={styles.button}>
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  const user: User = {
    _id: usuario._id as string,
    nombre: usuario.nombre,
    email: usuario.email,
    rol_id: usuario.rol_id as string,
  }

  return <Dashboard user={user} onLogout={() => void signOut()} />
}

function PantallaCarga({ texto }: { texto: string }) {
  return (
    <div style={styles.page}>
      <div style={styles.loadingBox}>
        <span style={styles.spinner} />
        <span style={styles.loadingText}>{texto}</span>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f9f7",
    padding: "24px",
  },
  loadingBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#64748b",
    fontSize: "14px",
  },
  loadingText: {
    fontSize: "14px",
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
  card: {
    maxWidth: "460px",
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "36px 32px",
    border: "1px solid #eef2ef",
    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
  },
  icon: {
    fontSize: "32px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1e293b",
    margin: "12px 0 8px 0",
  },
  desc: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.6,
    margin: "0 0 24px 0",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
}

export type { User }
