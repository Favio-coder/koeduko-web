import { useState } from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import Dashboard from "./pages/dashboard"
import Login from "./pages/Login"

interface User {
  _id: string
  nombre: string
  email: string
  rol_id: string
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

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

  if (!user) {
    return <Login />
  }

  return (
    <ConvexProvider client={convex}>
      <Dashboard user={user} onLogout={handleLogout} />
    </ConvexProvider>
  )
}

export type { User }
