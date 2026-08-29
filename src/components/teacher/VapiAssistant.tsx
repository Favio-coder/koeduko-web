import { useEffect, useRef, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { SessionLiveView } from "../SessionLiveView"
import { onTranscript, startSession, stopSession } from "../../lib/vapi"

interface VapiAssistantProps {
  userEmail: string
  userName: string
}

interface SessionIds {
  sessionId: Id<"study_sessions">
  vapiSessionId: Id<"vapi_sessions">
}

/**
 * Asistente de voz de la sesión en vivo.
 *
 * La sesión se crea primero en Convex para tener IDs reales antes de montar la
 * vista en vivo: sus queries usan validators v.id(), que rechazan cualquier
 * string inventado y hacen fallar el render.
 */
export default function VapiAssistant({ userEmail, userName }: VapiAssistantProps) {
  const [sessionIds, setSessionIds] = useState<SessionIds | null>(null)
  // "Hay sesión que mostrar" y "la llamada sigue abierta" son cosas distintas:
  // al cortar, los resultados tienen que seguir en pantalla.
  const [enVivo, setEnVivo] = useState(false)
  const [sessionError, setSessionError] = useState("")
  const [starting, setStarting] = useState(false)

  const createLiveSession = useMutation(api.functions.sessions.createLiveSession)
  const endLiveSession = useMutation(api.functions.sessions.endLiveSession)
  const attachVapiCallId = useMutation(api.functions.sessions.attachVapiCallId)
  const ingestTranscript = useMutation(api.functions.transcriptions.ingestTranscript)

  // El callId vive en una ref y no en el estado: el listener de transcripciones
  // se suscribe una sola vez, y con estado leería el valor congelado del render
  // en que se montó.
  const callIdRef = useRef<string | null>(null)

  /**
   * Guarda en Convex cada frase que Vapi transcribe en el navegador.
   *
   * Es la vía rápida: el texto aparece apenas se dice. El webhook transcribe la
   * misma llamada en paralelo por si la pestaña se cierra a mitad de sesión, y
   * Convex descarta lo que llegue repetido.
   */
  useEffect(() => {
    if (!sessionIds || !enVivo) return

    return onTranscript((line) => {
      const vapiCallId = callIdRef.current
      if (!vapiCallId) return

      void ingestTranscript({
        vapiCallId,
        role: line.role,
        text: line.text,
        secondsFromStart: line.secondsFromStart,
        source: "client",
      }).catch((error) => {
        // Una frase perdida no corta la sesión: el webhook la sigue guardando.
        console.error("No se pudo guardar la transcripción:", error)
      })
    })
  }, [sessionIds, enVivo, ingestTranscript])

  const handleStart = async () => {
    setSessionError("")
    setStarting(true)
    try {
      // La sesión se registra antes de que exista la llamada, así que arranca
      // con un identificador provisional.
      const placeholderCallId = `vapi-${Date.now()}`

      const ids = await createLiveSession({
        instructorEmail: userEmail,
        vapiCallId: placeholderCallId,
        title: `Sesión de ${userName}`,
      })

      callIdRef.current = placeholderCallId
      setSessionIds(ids)
      setEnVivo(true)

      const vapiCallId = await startSession(ids.sessionId, userName)

      if (!vapiCallId) {
        throw new Error("Vapi no devolvió un identificador de llamada.")
      }

      // Vapi identifica cada webhook con SU callId, no con el provisional. Sin
      // este reemplazo, todo lo que transcribe el servidor se descarta porque
      // no encuentra la sesión.
      callIdRef.current = vapiCallId
      await attachVapiCallId({ vapiSessionId: ids.vapiSessionId, vapiCallId })
    } catch (error) {
      console.error("No se pudo iniciar la sesión:", error)
      setSessionError(
        error instanceof Error ? error.message : "No se pudo iniciar la sesión."
      )
      // La llamada puede haber conectado antes de fallar el registro. Se corta
      // para no dejar un micrófono abierto contra una sesión que ya no existe.
      stopSession()
      callIdRef.current = null
      setSessionIds(null)
      setEnVivo(false)
    } finally {
      setStarting(false)
    }
  }

  const handleStop = async () => {
    stopSession()
    const activos = sessionIds

    // Los IDs NO se limpian acá. Borrarlos desmontaba la vista y el docente
    // se quedaba con la pantalla vacía justo cuando llegaban la transcripción
    // y los reportes, que tardan unos segundos más que el corte de la llamada.
    setEnVivo(false)
    callIdRef.current = null

    if (activos) {
      try {
        // endLiveSession deja agendado el reporte. No se pide acá porque los
        // análisis de las últimas frases todavía están corriendo y el reporte
        // saldría incompleto.
        await endLiveSession({ vapiSessionId: activos.vapiSessionId })
      } catch (error) {
        console.error("No se pudo cerrar la sesión en Convex:", error)
      }
    }
  }

  /**
   * Cierra los resultados y deja el panel listo para otra sesión.
   *
   * Es explícito y no automático: la transcripción y los reportes siguen
   * guardados en Convex, pero el docente decide cuándo dejar de mirarlos.
   */
  const handleNuevaSesion = () => {
    setSessionIds(null)
    setSessionError("")
  }

  const disabled = starting || enVivo

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.iconBadge}>🤖</div>
          <div>
            <h3 style={styles.title}>Asistente de IA por Voz</h3>
            <p style={styles.subtitle}>
              Conversación en vivo con el asistente. Analiza cada respuesta y genera reportes.
            </p>
          </div>
        </div>

        {enVivo && (
          <div style={styles.liveIndicator}>
            <span style={styles.pulseDot} />
            <span>Sesión activa</span>
          </div>
        )}
      </div>

      <div style={styles.actions}>
        <button
          onClick={handleStart}
          disabled={disabled}
          style={{
            ...styles.primaryBtn,
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          {starting ? "Iniciando..." : "🎙️ Iniciar Llamada"}
        </button>

        {enVivo && (
          <button onClick={handleStop} style={styles.stopBtn}>
            ⏹️ Detener
          </button>
        )}

        {sessionIds && !enVivo && (
          <button onClick={handleNuevaSesion} style={styles.secondaryBtn}>
            ✨ Nueva sesión
          </button>
        )}
      </div>

      {sessionError && <div style={styles.errorBox}>⚠️ {sessionError}</div>}

      {sessionIds && !enVivo && (
        <div style={styles.finishedBox}>
          <strong>Sesión finalizada.</strong> La transcripción ya está guardada.
          Los reportes por estudiante tardan unos 25 segundos en aparecer:
          primero terminan de analizarse las últimas respuestas.
        </div>
      )}

      {sessionIds && (
        <SessionLiveView
          vapiSessionId={sessionIds.vapiSessionId}
          sessionId={sessionIds.sessionId}
        />
      )}
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
    gap: "20px",
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
  iconBadge: {
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
    backgroundColor: "#eaf5ed",
    color: "#2e7d48",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2e7d48",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "12px 24px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 4px 14px rgba(46, 125, 72, 0.25)",
  },
  stopBtn: {
    padding: "12px 24px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
  },
  secondaryBtn: {
    padding: "12px 24px",
    backgroundColor: "#f0f7f2",
    color: "#2e7d48",
    border: "1px solid #c8e6d0",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  finishedBox: {
    backgroundColor: "#eaf5ed",
    border: "1px solid #c8e6d0",
    color: "#1e5631",
    fontSize: "13px",
    padding: "12px 16px",
    borderRadius: "10px",
    lineHeight: 1.5,
  },
}
