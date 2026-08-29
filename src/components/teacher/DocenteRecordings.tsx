/**
 * DocenteRecordings — Gestión de Sesiones Grabadas (SOLO DOCENTE)
 *
 * El docente puede:
 *  ✅ Ver todas sus grabaciones
 *  ✅ Reproducir grabaciones
 *  ✅ Ver estadísticas de cada sesión (estudiantes que escucharon)
 *  ✅ Ver info detallada de cada sesión
 *  ✅ Ver participantes
 *
 * El estudiante NO puede acceder a este componente.
 *
 * TODO: Reemplazar MOCK_RECORDINGS con query real:
 *   useQuery(api.grabaciones.porDocente, { docenteId })
 */

import { useState } from "react"

export interface DocenteRecording {
  id: string
  titulo: string
  curso: string
  fecha: string
  duracion: string
  urlAudio: string
  estudiantesEscucharon: number
  totalEstudiantes: number
  descripcion: string
  temas: string[]
  participantes: string[]
}

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_RECORDINGS: DocenteRecording[] = [
  {
    id: "drec-1",
    titulo: "Grabación: Lógica de Colecciones y Estado en React",
    curso: "Desarrollo Web Fullstack",
    fecha: "28 de agosto, 2026",
    duracion: "45 min",
    urlAudio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    estudiantesEscucharon: 18,
    totalEstudiantes: 24,
    descripcion: "Repaso interactivo de hooks, renderizado condicional y resolución de dudas comunes detectadas en el aula con IA.",
    temas: ["useState", "useEffect", "Renderizado condicional", "Manejo de listas"],
    participantes: ["Estudiante Carlos", "Lucía Fernández", "Marco Villanueva", "Sofía Ramírez", "+14 más"],
  },
  {
    id: "drec-2",
    titulo: "Grabación: Estructuras Lineales vs No Lineales",
    curso: "Algoritmos y Estructura de Datos",
    fecha: "25 de agosto, 2026",
    duracion: "60 min",
    urlAudio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    estudiantesEscucharon: 22,
    totalEstudiantes: 24,
    descripcion: "Clase magistral sobre pilas, colas y listas enlazadas con ejercicios prácticos en parejas.",
    temas: ["Pilas", "Colas", "Listas enlazadas", "Complejidad O(n)"],
    participantes: ["Estudiante Carlos", "Marco Villanueva", "Diego Pérez", "+19 más"],
  },
  {
    id: "drec-3",
    titulo: "Grabación: Introducción a Algoritmos de Ordenamiento",
    curso: "Algoritmos y Estructura de Datos",
    fecha: "20 de agosto, 2026",
    duracion: "55 min",
    urlAudio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    estudiantesEscucharon: 15,
    totalEstudiantes: 18,
    descripcion: "Análisis comparativo de Bubble Sort, Merge Sort y Quick Sort con casos de uso prácticos.",
    temas: ["Bubble Sort", "Merge Sort", "Quick Sort", "Análisis de complejidad"],
    participantes: ["Lucía Fernández", "Sofía Ramírez", "Diego Pérez", "+12 más"],
  },
]

// ─────────────────────────────────────────────────────────────────────────────

type ModalMode = "play" | "info" | null

interface ModalState {
  mode: ModalMode
  recording: DocenteRecording | null
}

export default function DocenteRecordings() {
  const [recordings] = useState<DocenteRecording[]>(MOCK_RECORDINGS)
  const [modal, setModal] = useState<ModalState>({ mode: null, recording: null })

  const openModal = (mode: ModalMode, rec: DocenteRecording) => setModal({ mode, recording: rec })
  const closeModal = () => setModal({ mode: null, recording: null })

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>🎥 Sesiones Grabadas — Panel del Docente</h2>
          <p style={s.subtitle}>
            Gestiona tus grabaciones, reproduce sesiones y consulta quién las escuchó
          </p>
        </div>
        <div style={s.headerStats}>
          <div style={s.headerStat}>
            <span style={s.headerStatVal}>{recordings.length}</span>
            <span style={s.headerStatLabel}>Grabaciones</span>
          </div>
          <div style={s.headerStat}>
            <span style={s.headerStatVal}>
              {recordings.reduce((t, r) => t + r.estudiantesEscucharon, 0)}
            </span>
            <span style={s.headerStatLabel}>Reproducciones</span>
          </div>
        </div>
      </div>

      {/* Recording Cards */}
      <div style={s.list}>
        {recordings.map((rec, idx) => {
          const escuchoPct = Math.round((rec.estudiantesEscucharon / rec.totalEstudiantes) * 100)
          return (
            <div key={rec.id} style={s.card}>
              {/* Left accent */}
              <div style={s.cardAccent} />

              <div style={s.cardBody}>
                <div style={s.cardTop}>
                  <div style={s.cardMeta}>
                    <span style={s.sesNum}>Sesión #{recordings.length - idx}</span>
                    <span style={s.courseTag}>📚 {rec.curso}</span>
                  </div>
                  <span style={s.dateBadge}>📅 {rec.fecha}</span>
                </div>

                <h3 style={s.recTitle}>{rec.titulo}</h3>
                <p style={s.recDesc}>{rec.descripcion}</p>

                {/* Topics chips */}
                <div style={s.topicsRow}>
                  {rec.temas.map((t) => (
                    <span key={t} style={s.topicChip}>{t}</span>
                  ))}
                </div>

                {/* Engagement metrics */}
                <div style={s.metricsRow}>
                  <div style={s.metricItem}>
                    <span style={s.metricLabel}>Estudiantes que escucharon</span>
                    <div style={s.progressRow}>
                      <div style={s.progressBg}>
                        <div
                          style={{
                            ...s.progressFill,
                            width: `${escuchoPct}%`,
                            backgroundColor: escuchoPct >= 80 ? "#2e7d48" : escuchoPct >= 60 ? "#3b82f6" : "#f59e0b",
                          }}
                        />
                      </div>
                      <span style={s.progressLabel}>
                        {rec.estudiantesEscucharon}/{rec.totalEstudiantes} ({escuchoPct}%)
                      </span>
                    </div>
                  </div>
                  <div style={s.metricItem}>
                    <span style={s.metricLabel}>Duración</span>
                    <span style={s.metricVal}>⏱️ {rec.duracion}</span>
                  </div>
                </div>

                {/* Action buttons — DOCENTE ONLY */}
                <div style={s.actions}>
                  <button
                    onClick={() => openModal("play", rec)}
                    style={s.playBtn}
                    title="Reproducir grabación"
                  >
                    ▶️ Reproducir
                  </button>
                  <button
                    onClick={() => openModal("info", rec)}
                    style={s.infoBtn}
                    title="Ver estadísticas y participantes"
                  >
                    📊 Estadísticas
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Modal: Reproducir ─── */}
      {modal.mode === "play" && modal.recording && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>📻 Reproduciendo sesión</h3>
              <button onClick={closeModal} style={s.closeBtn}>✕</button>
            </div>
            <p style={s.modalSubtitle}>{modal.recording.titulo}</p>
            <span style={s.modalMeta}>{modal.recording.curso} • {modal.recording.duracion}</span>
            <audio
              src={modal.recording.urlAudio}
              controls
              autoPlay
              style={s.audioPlayer}
            />
            <p style={s.modalDesc}>{modal.recording.descripcion}</p>
            <button onClick={closeModal} style={s.closePillBtn}>Cerrar reproductor</button>
          </div>
        </div>
      )}

      {/* ─── Modal: Estadísticas / Info ─── */}
      {modal.mode === "info" && modal.recording && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={{ ...s.modalCard, maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>📊 Estadísticas de la Sesión</h3>
              <button onClick={closeModal} style={s.closeBtn}>✕</button>
            </div>
            <h4 style={s.infoTitle}>{modal.recording.titulo}</h4>

            <div style={s.infoGrid}>
              <div style={s.infoItem}>
                <span style={s.infoLabel}>Curso</span>
                <span style={s.infoVal}>{modal.recording.curso}</span>
              </div>
              <div style={s.infoItem}>
                <span style={s.infoLabel}>Fecha</span>
                <span style={s.infoVal}>{modal.recording.fecha}</span>
              </div>
              <div style={s.infoItem}>
                <span style={s.infoLabel}>Duración</span>
                <span style={s.infoVal}>{modal.recording.duracion}</span>
              </div>
              <div style={s.infoItem}>
                <span style={s.infoLabel}>Escucharon</span>
                <span style={{ ...s.infoVal, color: "#2e7d48" }}>
                  {modal.recording.estudiantesEscucharon} / {modal.recording.totalEstudiantes} estudiantes
                </span>
              </div>
            </div>

            <div style={s.participantsBox}>
              <span style={s.infoLabel}>👥 Participantes que escucharon</span>
              <div style={s.participantsList}>
                {modal.recording.participantes.map((p) => (
                  <span key={p} style={s.participantChip}>{p}</span>
                ))}
              </div>
            </div>

            <div style={s.topicsBox}>
              <span style={s.infoLabel}>🏷️ Temas cubiertos</span>
              <div style={s.topicsRow}>
                {modal.recording.temas.map((t) => (
                  <span key={t} style={s.topicChip}>{t}</span>
                ))}
              </div>
            </div>

            <button onClick={closeModal} style={s.closePillBtn}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  container:       { display: "flex", flexDirection: "column", gap: "24px" },
  header:          { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" },
  title:           { fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px 0" },
  subtitle:        { fontSize: "13px", color: "#64748b", margin: 0 },
  headerStats:     { display: "flex", gap: "20px" },
  headerStat:      { display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#ffffff", borderRadius: "14px", padding: "12px 20px", border: "1px solid #eef2ef" },
  headerStatVal:   { fontSize: "22px", fontWeight: 800, color: "#2e7d48" },
  headerStatLabel: { fontSize: "11px", color: "#64748b" },

  list:            { display: "flex", flexDirection: "column", gap: "16px" },
  card:            { display: "flex", backgroundColor: "#ffffff", borderRadius: "20px", border: "1px solid #eef2ef", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", overflow: "hidden" },
  cardAccent:      { width: "6px", backgroundColor: "#2e7d48", flexShrink: 0 },
  cardBody:        { flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "14px" },

  cardTop:         { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" },
  cardMeta:        { display: "flex", gap: "10px", alignItems: "center" },
  sesNum:          { fontSize: "11px", fontWeight: 700, color: "#94a3b8", backgroundColor: "#f8fafc", padding: "3px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" },
  courseTag:       { fontSize: "12px", fontWeight: 700, color: "#2e7d48", backgroundColor: "#eaf5ed", padding: "4px 10px", borderRadius: "10px" },
  dateBadge:       { fontSize: "12px", color: "#64748b" },

  recTitle:        { fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0, lineHeight: 1.4 },
  recDesc:         { fontSize: "13px", color: "#475569", lineHeight: 1.5, margin: 0 },

  topicsRow:       { display: "flex", flexWrap: "wrap", gap: "6px" },
  topicChip:       { fontSize: "11px", fontWeight: 600, backgroundColor: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" },

  metricsRow:      { display: "flex", gap: "24px", flexWrap: "wrap" },
  metricItem:      { display: "flex", flexDirection: "column", gap: "6px" },
  metricLabel:     { fontSize: "11px", fontWeight: 600, color: "#94a3b8" },
  metricVal:       { fontSize: "13px", fontWeight: 700, color: "#334155" },

  progressRow:     { display: "flex", alignItems: "center", gap: "10px" },
  progressBg:      { width: "120px", height: "8px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden" },
  progressFill:    { height: "100%", borderRadius: "4px" },
  progressLabel:   { fontSize: "12px", fontWeight: 700, color: "#1e293b" },

  actions:         { display: "flex", gap: "10px", paddingTop: "4px" },
  playBtn:         { padding: "10px 20px", backgroundColor: "#2e7d48", color: "#ffffff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  infoBtn:         { padding: "10px 20px", backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },

  // Modal
  overlay:         { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" },
  modalCard:       { backgroundColor: "#ffffff", borderRadius: "24px", maxWidth: "500px", width: "100%", padding: "32px", boxShadow: "0 24px 48px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "90vh", overflowY: "auto" as const },
  modalHeader:     { display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle:      { fontSize: "18px", fontWeight: 800, color: "#1e293b", margin: 0 },
  closeBtn:        { backgroundColor: "transparent", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer", padding: "4px" },
  modalSubtitle:   { fontSize: "15px", fontWeight: 700, color: "#334155", margin: 0 },
  modalMeta:       { fontSize: "12px", color: "#64748b" },
  audioPlayer:     { width: "100%", borderRadius: "12px" },
  modalDesc:       { fontSize: "13px", color: "#475569", lineHeight: 1.5, margin: 0 },
  closePillBtn:    { alignSelf: "flex-end", padding: "10px 20px", backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },

  infoTitle:       { fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: 0 },
  infoGrid:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  infoItem:        { display: "flex", flexDirection: "column", gap: "4px", backgroundColor: "#f8faf8", padding: "12px", borderRadius: "10px" },
  infoLabel:       { fontSize: "11px", fontWeight: 600, color: "#94a3b8" },
  infoVal:         { fontSize: "14px", fontWeight: 700, color: "#1e293b" },

  participantsBox: { display: "flex", flexDirection: "column", gap: "8px" },
  participantsList:{ display: "flex", flexWrap: "wrap", gap: "6px" },
  participantChip: { fontSize: "11px", fontWeight: 600, backgroundColor: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "8px" },

  topicsBox:       { display: "flex", flexDirection: "column", gap: "8px" },
}
