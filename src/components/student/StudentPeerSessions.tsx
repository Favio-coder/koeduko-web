import { useState } from "react"
import EmptyState from "../common/EmptyState"

export interface PeerSession {
  id: string
  nombre: string
  tema: string
  fecha: string
  hora: string
  estado: "Completada" | "En progreso" | "Programada"
  participantesCount: number
  cursoRelacionado: string
  descripcion: string
  rolEstudiante: string
}

const DEFAULT_PEER_SESSIONS: PeerSession[] = [
  {
    id: "peer-1",
    nombre: "Sesión Peer: Introducción a React y Hooks",
    tema: "State Management con useState y useEffect",
    fecha: "29 de agosto, 2026",
    hora: "4:00 PM - 5:30 PM",
    estado: "Completada",
    participantesCount: 4,
    cursoRelacionado: "Desarrollo Web Fullstack",
    descripcion:
      "Reunión de estudio colaborativo entre pares para resolver las guías prácticas de React.",
    rolEstudiante: "Co-facilitador",
  },
  {
    id: "peer-2",
    nombre: "Sesión Peer: Árboles Binarios y Grafos",
    tema: "Recorridos DFS y BFS en código",
    fecha: "31 de agosto, 2026",
    hora: "6:00 PM - 7:30 PM",
    estado: "Programada",
    participantesCount: 3,
    cursoRelacionado: "Estructura de Datos",
    descripcion:
      "Taller práctico para implementar estructuras no lineales y preparar el laboratorio.",
    rolEstudiante: "Aprendiz",
  },
]

export default function StudentPeerSessions() {
  const [peerSessions, setPeerSessions] = useState<PeerSession[]>(DEFAULT_PEER_SESSIONS)
  const [showModal, setShowModal] = useState(false)

  // New Peer Session Form state
  const [newSession, setNewSession] = useState({
    nombre: "",
    tema: "",
    cursoRelacionado: "Desarrollo Web Fullstack",
    fecha: new Date().toISOString().split("T")[0],
    hora: "16:00",
    descripcion: "",
    rolEstudiante: "Co-facilitador",
  })

  const handleCreatePeerSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSession.nombre.trim()) return

    const created: PeerSession = {
      id: `peer-${Date.now()}`,
      nombre: newSession.nombre,
      tema: newSession.tema || newSession.nombre,
      fecha: newSession.fecha,
      hora: `${newSession.hora} hrs`,
      estado: "Programada",
      participantesCount: 1,
      cursoRelacionado: newSession.cursoRelacionado,
      descripcion: newSession.descripcion || "Sesión de estudio entre pares creada por un alumno.",
      rolEstudiante: newSession.rolEstudiante,
    }

    setPeerSessions([created, ...peerSessions])
    setShowModal(false)
    setNewSession({
      nombre: "",
      tema: "",
      cursoRelacionado: "Desarrollo Web Fullstack",
      fecha: new Date().toISOString().split("T")[0],
      hora: "16:00",
      descripcion: "",
      rolEstudiante: "Co-facilitador",
    })
  }

  const getStatusBadge = (estado: PeerSession["estado"]) => {
    switch (estado) {
      case "Completada":
        return <span style={{ ...styles.badge, backgroundColor: "#eaf5ed", color: "#2e7d48" }}>🟢 Completada</span>
      case "En progreso":
        return <span style={{ ...styles.badge, backgroundColor: "#e0f2fe", color: "#0369a1" }}>🔵 En progreso</span>
      case "Programada":
        return <span style={{ ...styles.badge, backgroundColor: "#fef3c7", color: "#92400e" }}>🟡 Programada</span>
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🤝 Mis Sesiones Peer Learning</h2>
          <p style={styles.subtitle}>
            Sesiones de estudio colaborativo creadas por y para estudiantes
          </p>
        </div>

        <button onClick={() => setShowModal(true)} style={styles.createBtn}>
          ➕ Crear nueva sesión Peer
        </button>
      </div>

      {peerSessions.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="Aún no tienes sesiones Peer"
          description="Participa o crea una sesión para comenzar a aprender junto a tus compañeros."
          actionLabel="🤝 Crear sesión Peer"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div style={styles.grid}>
          {peerSessions.map((session) => (
            <div key={session.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.courseTag}>📚 {session.cursoRelacionado}</span>
                {getStatusBadge(session.estado)}
              </div>

              <h3 style={styles.sessionTitle}>{session.nombre}</h3>
              <p style={styles.topicText}><strong>Tema:</strong> {session.tema}</p>
              <p style={styles.desc}>{session.descripcion}</p>

              <div style={styles.metaBox}>
                <span style={styles.metaItem}>📅 {session.fecha}</span>
                <span style={styles.metaItem}>⏰ {session.hora}</span>
                <span style={styles.metaItem}>👥 {session.participantesCount} participantes</span>
                <span style={styles.rolePill}>Rol: {session.rolEstudiante}</span>
              </div>

              <div style={styles.cardFooter}>
                <button
                  onClick={() => alert(`Accediendo a la sesión Peer: ${session.nombre}`)}
                  style={styles.actionBtn}
                >
                  Ver sesión Peer →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Crear Nueva Sesion Peer */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>🤝 Crear Nueva Sesión Peer Learning</h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePeerSession} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Título / Nombre de la Sesión</label>
                <input
                  type="text"
                  value={newSession.nombre}
                  onChange={(e) => setNewSession((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="ej: Sesión Peer: Repaso de Algoritmos"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Tema Principal</label>
                <input
                  type="text"
                  value={newSession.tema}
                  onChange={(e) => setNewSession((p) => ({ ...p, tema: e.target.value }))}
                  placeholder="ej: Recursividad y Estructuras de Datos"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Curso Relacionado</label>
                  <select
                    value={newSession.cursoRelacionado}
                    onChange={(e) => setNewSession((p) => ({ ...p, cursoRelacionado: e.target.value }))}
                    style={styles.input}
                  >
                    <option value="Desarrollo Web Fullstack">Desarrollo Web Fullstack</option>
                    <option value="Estructura de Datos">Estructura de Datos</option>
                    <option value="Inteligencia Artificial P2P">Inteligencia Artificial P2P</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Tu Rol en la Sesión</label>
                  <select
                    value={newSession.rolEstudiante}
                    onChange={(e) => setNewSession((p) => ({ ...p, rolEstudiante: e.target.value }))}
                    style={styles.input}
                  >
                    <option value="Co-facilitador">Co-facilitador (Organizador)</option>
                    <option value="Aprendiz">Aprendiz (Buscando apoyo)</option>
                    <option value="Sintetizador">Sintetizador (Apuntes y código)</option>
                  </select>
                </div>
              </div>

              <div style={styles.fieldGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Fecha</label>
                  <input
                    type="date"
                    value={newSession.fecha}
                    onChange={(e) => setNewSession((p) => ({ ...p, fecha: e.target.value }))}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Hora de inicio</label>
                  <input
                    type="time"
                    value={newSession.hora}
                    onChange={(e) => setNewSession((p) => ({ ...p, hora: e.target.value }))}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Descripción u Objetivos</label>
                <textarea
                  rows={3}
                  value={newSession.descripcion}
                  onChange={(e) => setNewSession((p) => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Detalla qué temas se practicarán durante la sesión..."
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" style={styles.saveBtn}>
                  🤝 Crear Sesión Peer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  createBtn: {
    padding: "10px 20px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(46, 125, 72, 0.2)",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #eef2ef",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.03)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseTag: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#0369a1",
  },
  badge: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "8px",
  },
  sessionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
    lineHeight: 1.4,
  },
  topicText: {
    fontSize: "13px",
    color: "#334155",
    margin: 0,
  },
  desc: {
    fontSize: "12px",
    color: "#64748b",
    lineHeight: 1.4,
    margin: 0,
  },
  metaBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    padding: "12px",
    backgroundColor: "#f8faf8",
    borderRadius: "10px",
    fontSize: "12px",
    color: "#475569",
  },
  metaItem: {
    fontWeight: 600,
  },
  rolePill: {
    marginLeft: "auto",
    fontSize: "11px",
    fontWeight: 700,
    color: "#2e7d48",
    backgroundColor: "#eaf5ed",
    padding: "2px 8px",
    borderRadius: "6px",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "8px",
  },
  actionBtn: {
    padding: "8px 16px",
    backgroundColor: "#ffffff",
    color: "#2e7d48",
    border: "1px solid #c8e6d0",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "20px",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    maxWidth: "520px",
    width: "100%",
    padding: "28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  closeBtn: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "18px",
    color: "#94a3b8",
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#334155",
  },
  input: {
    backgroundColor: "#ffffff",
    color: "#1e293b",
    border: "1.5px solid #cbd5e1",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
  },
  textarea: {
    backgroundColor: "#ffffff",
    color: "#1e293b",
    border: "1.5px solid #cbd5e1",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    fontFamily: "inherit",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px",
  },
  cancelBtn: {
    padding: "10px 18px",
    backgroundColor: "#ffffff",
    color: "#64748b",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "13px",
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
