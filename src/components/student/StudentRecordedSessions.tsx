import { useState } from "react"
import EmptyState from "../common/EmptyState"

export interface RecordedSession {
  id: string
  titulo: string
  curso: string
  docente: string
  fecha: string
  duracion: string
  urlAudio: string
  descripcion: string
}

const DEFAULT_RECORDINGS: RecordedSession[] = [
  {
    id: "rec-1",
    titulo: "Sesión 04: Estrategias de Lógica y Colecciones en React",
    curso: "Desarrollo Web Fullstack",
    docente: "Profesor Ana",
    fecha: "28 de agosto, 2026",
    duracion: "45 min",
    urlAudio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    descripcion:
      "Repaso interactivo de hooks, renderizado condicional y resolución de dudas comunes detectadas en el aula.",
  },
  {
    id: "rec-2",
    titulo: "Sesión 03: Estructuras Lineales vs No Lineales",
    curso: "Estructura de Datos",
    docente: "Profesor Ana",
    fecha: "25 de agosto, 2026",
    duracion: "60 min",
    urlAudio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    descripcion:
      "Clase magistral sobre pilas, colas y listas enlazadas con ejercicios prácticos en parejas.",
  },
]

export default function StudentRecordedSessions() {
  const [recordings] = useState<RecordedSession[]>(DEFAULT_RECORDINGS)
  const [selectedSession, setSelectedSession] = useState<RecordedSession | null>(null)

  if (recordings.length === 0) {
    return (
      <EmptyState
        icon="🎥"
        title="No hay sesiones grabadas"
        description="Cuando tu docente grabe una sesión, podrás verla y reproducirla aquí."
      />
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🎥 Sesiones Grabadas por tus Docentes</h2>
          <p style={styles.subtitle}>
            Accede a las grabaciones de tus clases para repasar los conceptos explicados
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        {recordings.map((rec) => (
          <div key={rec.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.badgeDocente}>👨‍🏫 {rec.docente}</span>
              <span style={styles.badgeDuration}>⏱️ {rec.duracion}</span>
            </div>

            <h3 style={styles.recTitle}>{rec.titulo}</h3>
            <span style={styles.courseTag}>📚 {rec.curso}</span>

            <p style={styles.desc}>{rec.descripcion}</p>

            <div style={styles.footerRow}>
              <span style={styles.dateText}>📅 {rec.fecha}</span>
              <button onClick={() => setSelectedSession(rec)} style={styles.playBtn}>
                ▶️ Reproducir Grabación
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Audio Playback Modal */}
      {selectedSession && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>📻 Reproduciendo: {selectedSession.titulo}</h3>
              <button onClick={() => setSelectedSession(null)} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <span style={styles.modalMeta}>
                Impartido por {selectedSession.docente} • {selectedSession.curso} ({selectedSession.duracion})
              </span>

              <audio src={selectedSession.urlAudio} controls autoPlay style={styles.audioPlayer} />

              <p style={styles.modalDesc}>{selectedSession.descripcion}</p>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setSelectedSession(null)} style={styles.closeModalBtn}>
                Cerrar Reproductor
              </button>
            </div>
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
    marginBottom: "4px",
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
  badgeDocente: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#2e7d48",
    backgroundColor: "#eaf5ed",
    padding: "4px 10px",
    borderRadius: "10px",
  },
  badgeDuration: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "10px",
  },
  recTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
    lineHeight: 1.4,
  },
  courseTag: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#0369a1",
  },
  desc: {
    fontSize: "13px",
    color: "#475569",
    lineHeight: 1.5,
    margin: 0,
  },
  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
    marginTop: "auto",
  },
  dateText: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  playBtn: {
    padding: "8px 16px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
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
    maxWidth: "500px",
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
    fontSize: "16px",
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
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  modalMeta: {
    fontSize: "12px",
    color: "#64748b",
  },
  audioPlayer: {
    width: "100%",
  },
  modalDesc: {
    fontSize: "13px",
    color: "#334155",
    margin: 0,
    lineHeight: 1.5,
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
  closeModalBtn: {
    padding: "10px 18px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
  },
}
