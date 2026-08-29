import { useState } from "react"
import type { User } from "../../App"

interface UserProfileProps {
  user: User
  onUpdateUser: (updated: User) => void
}

export default function UserProfile({ user, onUpdateUser }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: user.nombre || "",
    apellido: user.apellido || "",
    avatar: user.avatar || (user.rol === "docente" ? "👨‍🏫" : "👨‍🎓"),
    bio: user.bio || "",
    institucion: user.institucion || "Universidad Nacional de Ingeniería",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedUser: User = {
      ...user,
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim() || undefined,
      bio: formData.bio.trim() || undefined,
      institucion: formData.institucion.trim(),
      avatar: formData.avatar,
    }

    localStorage.setItem("koeduko_user", JSON.stringify(updatedUser))
    onUpdateUser(updatedUser)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      avatar: user.avatar || (user.rol === "docente" ? "👨‍🏫" : "👨‍🎓"),
      bio: user.bio || "",
      institucion: user.institucion || "Universidad Nacional de Ingeniería",
    })
    setIsEditing(false)
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <div style={styles.avatarLarge}>
            {user.avatar || (user.rol === "docente" ? "👨‍🏫" : "👨‍🎓")}
          </div>
          <div>
            <h2 style={styles.nameTitle}>
              {user.nombre} {user.apellido || ""}
            </h2>
            <span
              style={{
                ...styles.roleBadge,
                backgroundColor: user.rol === "docente" ? "#eaf5ed" : "#e0f2fe",
                color: user.rol === "docente" ? "#2e7d48" : "#0284c7",
              }}
            >
              {user.rol === "docente" ? "👨‍🏫 Docente" : "👨‍🎓 Estudiante"}
            </span>
          </div>
        </div>

        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
            ✏️ Editar perfil
          </button>
        )}
      </div>

      {!isEditing ? (
        /* Read Mode */
        <div style={styles.infoBody}>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Correo electrónico</span>
              <span style={styles.infoValue}>{user.email}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Universidad / Institución</span>
              <span style={styles.infoValue}>
                {user.institucion || "Universidad Nacional de Ingeniería"}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Carrera / Área</span>
              <span style={styles.infoValue}>
                {user.carrera || "Computación e Informática"}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Rol en la plataforma</span>
              <span style={styles.infoValue}>
                {user.rol === "docente" ? "Docente Instructor" : "Estudiante / Aprendiz Peer"}
              </span>
            </div>
          </div>

          <div style={styles.bioBox}>
            <span style={styles.infoLabel}>Biografía / Descripción</span>
            <p style={styles.bioText}>
              {user.bio ||
                "Sin descripción personal ingresada. Haz clic en 'Editar perfil' para agregar tu información."}
            </p>
          </div>

          {/* Cursos Relacionados */}
          <div style={styles.coursesSection}>
            <span style={styles.infoLabel}>Cursos asignados</span>
            <div style={styles.chipsRow}>
              <span style={styles.courseChip}>📚 Programación Orientada a Objetos</span>
              <span style={styles.courseChip}>💻 Desarrollo Web Fullstack</span>
              <span style={styles.courseChip}>⚡ Inteligencia Artificial P2P</span>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode Form */
        <form onSubmit={handleSave} style={styles.editForm}>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Avatar / Icono</label>
              <select
                name="avatar"
                value={formData.avatar}
                onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
                style={styles.input}
              >
                <option value="👨‍🏫">👨‍🏫 Docente</option>
                <option value="👩‍🏫">👩‍🏫 Docente Mujer</option>
                <option value="👨‍🎓">👨‍🎓 Estudiante</option>
                <option value="👩‍🎓">👩‍🎓 Estudiante Mujer</option>
                <option value="💻">💻 Developer</option>
                <option value="🚀">🚀 Pro</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Ingresa tu apellido"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Universidad / Institución</label>
              <input
                type="text"
                name="institucion"
                value={formData.institucion}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldFull}>
            <label style={styles.label}>Biografía / Sobre mí</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Escribe una breve descripción personal..."
              style={styles.textarea}
            />
          </div>

          <div style={styles.readOnlyNote}>
            ℹ️ El correo electrónico ({user.email}) y el rol ({user.rol}) no se pueden modificar.
          </div>

          <div style={styles.formActions}>
            <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
              Cancelar
            </button>
            <button type="submit" style={styles.saveBtn}>
              💾 Guardar cambios
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    border: "1px solid #eef2ef",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  avatarLarge: {
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    backgroundColor: "#f0f7f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    border: "1px solid #e1efe5",
  },
  nameTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  roleBadge: {
    fontSize: "12px",
    fontWeight: 700,
    padding: "4px 12px",
    borderRadius: "12px",
  },
  editBtn: {
    padding: "10px 18px",
    backgroundColor: "#ffffff",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
  },
  infoBody: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "14px",
    backgroundColor: "#f8faf8",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  infoLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1e293b",
  },
  bioBox: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "16px",
    backgroundColor: "#f8faf8",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  bioText: {
    fontSize: "14px",
    color: "#334155",
    lineHeight: 1.5,
    margin: 0,
  },
  coursesSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  chipsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  courseChip: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#2e7d48",
    backgroundColor: "#eaf5ed",
    padding: "6px 12px",
    borderRadius: "12px",
  },
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fieldFull: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
  },
  input: {
    backgroundColor: "#ffffff",
    color: "#1e293b",
    border: "1.5px solid #cbd5e1",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "14px",
  },
  textarea: {
    backgroundColor: "#ffffff",
    color: "#1e293b",
    border: "1.5px solid #cbd5e1",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical" as const,
  },
  readOnlyNote: {
    fontSize: "12px",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "10px 14px",
    borderRadius: "10px",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#ffffff",
    color: "#64748b",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
  },
  saveBtn: {
    padding: "10px 20px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
  },
}
