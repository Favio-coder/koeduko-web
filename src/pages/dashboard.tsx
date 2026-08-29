import { useState } from "react"
import type { User } from "../App"
import DocenteDashboard from "./DocenteDashboard"
import StudentDashboard from "./StudentDashboard"

interface DashboardProps {
  user: User
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentUser, setCurrentUser] = useState<User>(user)

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser)
  }

  // Si el usuario es Docente (o instructor/profesor)
  if (currentUser.rol === "docente" || currentUser.rol === "instructor") {
    return (
      <DocenteDashboard
        user={currentUser}
        onLogout={onLogout}
        onUpdateUser={handleUpdateUser}
      />
    )
  }

  // De lo contrario, renderizar el Dashboard exclusivo de Estudiante
  return (
    <StudentDashboard
      user={currentUser}
      onLogout={onLogout}
      onUpdateUser={handleUpdateUser}
    />
  )
}