import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

interface AudioRecorderProps {
  userEmail: string
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

const formatFecha = (timestamp: number) =>
  new Date(timestamp).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

/**
 * Graba el audio del aula y lo sube al storage de Convex.
 *
 * La grabación queda guardada y se puede reproducir, pero todavía no se
 * transcribe: eso necesita un servicio de speech-to-text, que Claude no
 * provee. Hasta entonces el estado se muestra como pendiente en lugar de
 * mostrar un análisis que nadie calculó.
 */
export default function AudioRecorder({ userEmail }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  // La duración vive en una ref además del estado: onstop se dispara fuera del
  // ciclo de render y leería el valor congelado del render en que se montó.
  const duracionRef = useRef(0)

  const generateUploadUrl = useMutation(api.functions.recordings.generateUploadUrl)
  const saveRecording = useMutation(api.functions.recordings.saveRecording)
  const deleteRecording = useMutation(api.functions.recordings.deleteRecording)
  const grabaciones = useQuery(api.functions.recordings.listRecordings, {
    autorEmail: userEmail,
  })

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const subirGrabacion = async (blob: Blob, duracionSegundos: number) => {
    setSubiendo(true)
    setError("")
    try {
      // El archivo va directo al storage: una mutation no puede transportar
      // varios megabytes de audio como argumento.
      const uploadUrl = await generateUploadUrl()
      const respuesta = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      })

      if (!respuesta.ok) {
        throw new Error(`La subida falló con estado ${respuesta.status}`)
      }

      const { storageId } = (await respuesta.json()) as {
        storageId: Id<"_storage">
      }

      await saveRecording({
        autorEmail: userEmail,
        storageId,
        duracionSegundos,
        titulo: `Clase del ${formatFecha(Date.now())}`,
      })
    } catch (err) {
      console.error("No se pudo guardar la grabación:", err)
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la grabación."
      )
    } finally {
      setSubiendo(false)
    }
  }

  const startRecording = async () => {
    setError("")
    audioChunksRef.current = []
    setRecordingTime(0)
    duracionRef.current = 0

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador no permite acceder al micrófono.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        // Una grabación vacía no se sube: ocuparía storage sin contenido.
        if (blob.size > 0) {
          void subirGrabacion(blob, duracionRef.current)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      timerRef.current = window.setInterval(() => {
        duracionRef.current += 1
        setRecordingTime(duracionRef.current)
      }, 1000)
    } catch (err) {
      // Sin micrófono no hay nada que grabar. Antes se caía en un modo
      // simulado que inventaba un análisis; ahora se dice lo que pasó.
      console.error("No se pudo acceder al micrófono:", err)
      setError(
        "No se pudo acceder al micrófono. Revisá los permisos del navegador."
      )
    }
  }

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const handleEliminar = async (recordingId: Id<"classroom_recordings">) => {
    try {
      await deleteRecording({ recordingId, autorEmail: userEmail })
    } catch (err) {
      console.error("No se pudo eliminar la grabación:", err)
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar la grabación."
      )
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.micBadge}>🎙️</div>
          <div>
            <h3 style={styles.title}>Escuchar Salón de Clases</h3>
            <p style={styles.subtitle}>
              Graba la clase y guardala para revisarla después
            </p>
          </div>
        </div>

        {isRecording && (
          <div style={styles.liveIndicator}>
            <span style={styles.pulseDot} />
            <span>Grabando... {formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}

      <div style={styles.recorderArea}>
        {!isRecording ? (
          <div style={styles.startWrapper}>
            <button
              onClick={startRecording}
              disabled={subiendo}
              style={{
                ...styles.micButton,
                opacity: subiendo ? 0.6 : 1,
                cursor: subiendo ? "not-allowed" : "pointer",
              }}
            >
              <span style={styles.micIcon}>🎙️</span>
              <span>{subiendo ? "Guardando..." : "Iniciar Escucha del Aula"}</span>
            </button>
            <span style={styles.micHint}>
              El audio se guarda en Convex al detener la grabación
            </span>
          </div>
        ) : (
          <div style={styles.activeWrapper}>
            <div style={styles.waveformContainer}>
              <div style={styles.waveBar} />
              <div style={styles.waveBar} />
              <div style={styles.waveBar} />
              <div style={styles.waveBar} />
              <div style={styles.waveBar} />
            </div>

            <button onClick={stopRecording} style={styles.stopButton}>
              ⏹️ Detener y Guardar
            </button>
          </div>
        )}
      </div>

      {/* Grabaciones guardadas */}
      <div style={styles.recordingsSection}>
        <h4 style={styles.recordingsTitle}>
          {grabaciones === undefined
            ? "Cargando grabaciones..."
            : grabaciones.length === 0
            ? "Todavía no hay grabaciones guardadas"
            : `Grabaciones guardadas (${grabaciones.length})`}
        </h4>

        {grabaciones && grabaciones.length > 0 && (
          <div style={styles.recordingsList}>
            {grabaciones.map((grabacion) => (
              <div key={grabacion.id} style={styles.recordingRow}>
                <div style={styles.recordingInfo}>
                  <span style={styles.recordingTitle}>
                    {grabacion.titulo ?? "Grabación sin título"}
                  </span>
                  <span style={styles.recordingMeta}>
                    {formatTime(grabacion.duracionSegundos)} ·{" "}
                    {formatFecha(grabacion.createdAt)}
                  </span>
                </div>

                {grabacion.url && (
                  <audio src={grabacion.url} controls style={styles.audioEl} />
                )}

                <div style={styles.recordingActions}>
                  <span style={styles.pendingBadge}>
                    {grabacion.estado === "transcrita"
                      ? "✓ Transcrita"
                      : "⏳ Transcripción pendiente"}
                  </span>
                  <button
                    onClick={() => handleEliminar(grabacion.id)}
                    style={styles.deleteBtn}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={styles.pendingNote}>
          El análisis automático necesita transcribir el audio a texto, que es un
          servicio aparte del que analiza. Hasta conectarlo, las grabaciones
          quedan guardadas y se pueden escuchar.
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    border: "1px solid #eef2ef",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
  },
  titleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  micBadge: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "#eaf5ed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 14px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#dc2626",
    animation: "pulse 1.2s infinite",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
  },
  recorderArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px",
    backgroundColor: "#f8faf8",
    borderRadius: "16px",
    border: "2px dashed #cbd5e1",
  },
  startWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  micButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 32px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "50px",
    fontSize: "16px",
    fontWeight: 700,
    boxShadow: "0 8px 20px rgba(46, 125, 72, 0.25)",
  },
  micIcon: {
    fontSize: "20px",
  },
  micHint: {
    fontSize: "12px",
    color: "#64748b",
  },
  activeWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  waveformContainer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    height: "40px",
  },
  waveBar: {
    width: "6px",
    height: "30px",
    backgroundColor: "#2e7d48",
    borderRadius: "4px",
  },
  stopButton: {
    padding: "12px 24px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
  },
  recordingsSection: {
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  recordingsTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  recordingsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  recordingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "#f8faf8",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },
  recordingInfo: {
    display: "flex",
    flexDirection: "column",
  },
  recordingTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#1e293b",
  },
  recordingMeta: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  audioEl: {
    height: "36px",
    flex: 1,
    minWidth: "220px",
  },
  recordingActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  pendingBadge: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#92400e",
    backgroundColor: "#fef3c7",
    padding: "4px 10px",
    borderRadius: "10px",
  },
  deleteBtn: {
    padding: "6px 12px",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  pendingNote: {
    fontSize: "12px",
    color: "#64748b",
    backgroundColor: "#f8faf8",
    border: "1px solid #e2e8f0",
    padding: "12px 14px",
    borderRadius: "10px",
    margin: 0,
    lineHeight: 1.5,
  },
}
