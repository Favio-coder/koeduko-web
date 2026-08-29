import { useState } from "react"
import Dashboard from "./pages/dashboard"
import Login from "./pages/Login"
import { ErrorBoundary } from "./components/ErrorBoundary"

interface User {
  _id: string
  nombre: string
  email: string
  rol_id: string
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("koeduko_user")
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        localStorage.removeItem("koeduko_user")
      }
    }
    return null
  })

  const handleLogout = () => {
    localStorage.removeItem("koeduko_user")
    setUser(null)
    window.location.href = "/"
  }

  // main.tsx ya monta el ConvexProvider, así que acá solo hace falta el
  // boundary: sin él, un error de render deja la pantalla en blanco.
  if (!user) {
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <Dashboard user={user} onLogout={handleLogout} />
    </ErrorBoundary>
  )
}

export type { User }
