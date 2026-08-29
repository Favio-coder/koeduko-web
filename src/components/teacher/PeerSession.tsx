import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { SessionLiveView } from "../SessionLiveView"
import { onTranscript, startSession, stopSession } from "../../lib/vapi"

interface Participante {
  id: Id<"usuario">
  nombre: string
}

interface SesionActiva {
  sessionId: Id<"study_sessions">
  vapiSessionId: Id<"vapi_sessions">
  mentor: Participante
  aprendiz: Participante
}

/**
 * Sesión de aprendizaje entre dos estudiantes.
 *
 * Vapi transcribe una sola pista de audio, así que no puede saber por sí mismo
 * cuál de los dos habló. Quien conduce la sesión marca el turno, y cada frase
 * se atribuye a ese estudiante. Es manual a propósito: separar hablantes
 * automáticamente exige diarización, un servicio aparte, y atribuir mal las
 * respuestas arruinaría los reportes individuales.
 */
export default function PeerSession() {
  const parejas = useQuery(api.functions.groupings.sugerirParejas)
  const createPeerSession = useMutation(api.functions.sessions.createPeerSession)
  const endLiveSession = useMutation(api.functions.sessions.endLiveSession)
  const ingestTranscript = useMutation(api.functions.transcriptions.ingestTranscript)

  const [sesion, setSesion] = useState<SesionActiva | null>(null)
  const [enVivo, setEnVivo] = useState(false)
  const [iniciando, setIniciando] = useState(false)
  const [error, setError] = useState("")
  const [hablaMentor, setHablaMentor] = useState(true)

  const callIdRef = useRef<string | null>(null)
  // El turno vive en una ref además del estado: el listener se suscribe una vez
  // y con estado leería el valor del render en que se montó, atribuyendo todas
  // las frases al primer hablante.
  const hablaMentorRef = useRef(true)

  const cambiarTurno = (esMentor: boolean) => {
    hablaMentorRef.current = esMentor
    setHablaMentor(esMentor)
  }

  useEffect(() => {
    if (!sesion || !enVivo) return

    return onTranscript((line) => {
      const vapiCallId = callIdRef.current
      if (!vapiCallId) return

      // Al asistente no se le asigna estudiante: sus intervenciones se guardan
      // para dar contexto, pero no se evalúan.
      const userId =
        line.role === "assistant"
          ? undefined
          : hablaMentorRef.current
          ? sesion.mentor.id
          : sesion.aprendiz.id

      void ingestTranscript({
        vapiCallId,
        role: line.role,
        text: line.text,
        secondsFromStart: line.secondsFromStart,
        source: "client",
        userId,
      }).catch((err) => {
        console.error("No se pudo guardar la transcripción:", err)
      })
    })
  }, [sesion, enVivo, ingestTranscript])

  const iniciar = async (
    mentorId: Id<"usuario">,
    aprendizId: Id<"usuario">,
    tema: string | null
  ) => {
    setError("")
    setIniciando(true)
    try {
      // randomUUID y no un timestamp: dos sesiones que arranquen en el mismo
      // milisegundo compartirían callId, y las transcripciones de una caerían
      // en la otra.
      const vapiCallId = `peer-${crypto.randomUUID()}`
      const creada = await createPeerSession({
        mentorId,
        aprendizId,
        tema: tema ?? undefined,
        vapiCallId,
      })

      callIdRef.current = vapiCallId
      cambiarTurno(true)
      setSesion(creada)
      setEnVivo(true)

      await startSession(creada.sessionId, creada.mentor.nombre)
    } catch (err) {
      console.error("No se pudo iniciar la sesión entre pares:", err)
      setError(err instanceof Error ? err.message : "No se pudo iniciar la sesión.")
      stopSession()
      callIdRef.current = null
      setSesion(null)
      setEnVivo(false)
    } finally {
      setIniciando(false)
    }
  }

  const detener = async () => {
    stopSession()
    setEnVivo(false)
    callIdRef.current = null

    if (sesion) {
      try {
        await endLiveSession({ vapiSessionId: sesion.vapiSessionId })
      } catch (err) {
        console.error("No se pudo cerrar la sesión:", err)
      }
    }
  }

  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.iconBadge}>🤝</div>
          <div>
            <h3 style={styles.title}>Sesión entre Pares</h3>
            <p style={styles.subtitle}>
              Un estudiante acompaña a otro en el tema que le cuesta
            </p>
          </div>
        </div>

        {enVivo && (
          <div style={styles.liveIndicator}>
            <span style={styles.pulseDot} />
            <span>En vivo</span>
          </div>
        )}
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}

      {/* Selector de turno: solo mientras la llamada está abierta */}
      {sesion && enVivo && (
        <div style={styles.turnoBox}>
          <span style={styles.turnoLabel}>¿Quién está hablando?</span>
          <div style={styles.turnoBotones}>
            <button
              onClick={() => cambiarTurno(true)}
              style={{
                ...styles.turnoBtn,
                ...(hablaMentor ? styles.turnoBtnActivo : {}),
              }}
            >
              👑 {sesion.mentor.nombre}
            </button>
            <button
              onClick={() => cambiarTurno(false)}
              style={{
                ...styles.turnoBtn,
                ...(!hablaMentor ? styles.turnoBtnActivo : {}),
              }}
            >
              🌱 {sesion.aprendiz.nombre}
            </button>
          </div>
          <p style={styles.turnoHint}>
            Cambiá el turno cuando cambia quien habla. Cada frase se atribuye al
            estudiante marcado, y de ahí sale su reporte.
          </p>
        </div>
      )}

      {sesion && enVivo && (
        <button onClick={detener} style={styles.stopBtn}>
          ⏹️ Terminar sesión
        </button>
      )}

      {sesion && !enVivo && (
        <>
          <div style={styles.finishedBox}>
            <strong>Sesión finalizada.</strong> Los reportes de{" "}
            {sesion.mentor.nombre} y {sesion.aprendiz.nombre} tardan unos 25
            segundos en aparecer.
          </div>
          <button onClick={() => setSesion(null)} style={styles.secondaryBtn}>
            ✨ Otra pareja
          </button>
        </>
      )}

      {/* Parejas sugeridas: solo cuando no hay sesión en curso */}
      {!sesion && (
        <>
          {parejas === undefined ? (
            <p style={styles.muted}>Buscando parejas...</p>
          ) : parejas.length === 0 ? (
            <p style={styles.muted}>
              Todavía no hay suficientes estudiantes con desempeño medido para
              armar parejas. Hacé al menos dos sesiones con el asistente y volvé
              acá.
            </p>
          ) : (
            <div style={styles.parejasList}>
              {parejas.map((pareja) => (
                <div key={pareja.mentor.id} style={styles.parejaCard}>
                  <div style={styles.parejaPersonas}>
                    <div style={styles.persona}>
                      <span style={styles.personaRol}>👑 Acompaña</span>
                      <span style={styles.personaNombre}>
                        {pareja.mentor.nombre}
                      </span>
                      <span style={styles.personaNota}>
                        {pareja.mentor.avgQuality}/10
                      </span>
                    </div>

                    <span style={styles.flecha}>→</span>

                    <div style={styles.persona}>
                      <span style={styles.personaRol}>🌱 Refuerza</span>
                      <span style={styles.personaNombre}>
                        {pareja.aprendiz.nombre}
                      </span>
                      <span style={styles.personaNota}>
                        {pareja.aprendiz.avgQuality}/10
                      </span>
                    </div>
                  </div>

                  {pareja.tema && (
                    <div style={styles.temaBox}>
                      <span style={styles.temaLabel}>Tema sugerido:</span>{" "}
                      <span style={styles.temaTexto}>{pareja.tema}</span>
                      {!pareja.temaLoDominaElMentor && (
                        <span style={styles.temaAviso}>
                          — el mentor no lo tiene registrado como dominado, así
                          que conviene revisarlo antes
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() =>
                      iniciar(pareja.mentor.id, pareja.aprendiz.id, pareja.tema)
                    }
                    disabled={iniciando}
                    style={{
                      ...styles.startBtn,
                      opacity: iniciando ? 0.6 : 1,
                      cursor: iniciando ? "not-allowed" : "pointer",
                    }}
                  >
                    {iniciando ? "Iniciando..." : "🎙️ Iniciar sesión entre pares"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {sesion && (
        <SessionLiveView
          vapiSessionId={sesion.vapiSessionId}
          sessionId={sesion.sessionId}
        />
      )}
    </section>
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
    gap: "18px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
  },
  titleGroup: { display: "flex", alignItems: "center", gap: "14px" },
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
  title: { fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" },
  subtitle: { fontSize: "13px", color: "#64748b", margin: 0 },
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
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
  },
  turnoBox: {
    backgroundColor: "#f8faf8",
    border: "2px solid #2e7d48",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  turnoLabel: { fontSize: "13px", fontWeight: 700, color: "#1e293b" },
  turnoBotones: { display: "flex", gap: "10px", flexWrap: "wrap" },
  turnoBtn: {
    flex: 1,
    minWidth: "150px",
    padding: "14px 18px",
    backgroundColor: "#ffffff",
    color: "#64748b",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  turnoBtnActivo: {
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "2px solid #2e7d48",
  },
  turnoHint: { fontSize: "11px", color: "#64748b", margin: 0, lineHeight: 1.5 },
  stopBtn: {
    padding: "12px 24px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    alignSelf: "flex-start",
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
    alignSelf: "flex-start",
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
  muted: { fontSize: "13px", color: "#94a3b8", margin: 0, lineHeight: 1.6 },
  parejasList: { display: "flex", flexDirection: "column", gap: "14px" },
  parejaCard: {
    backgroundColor: "#f8faf8",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  parejaPersonas: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  persona: { display: "flex", flexDirection: "column", gap: "2px" },
  personaRol: { fontSize: "10px", fontWeight: 700, color: "#2e7d48" },
  personaNombre: { fontSize: "15px", fontWeight: 700, color: "#1e293b" },
  personaNota: { fontSize: "11px", color: "#94a3b8" },
  flecha: { fontSize: "20px", color: "#2e7d48", fontWeight: 700 },
  temaBox: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fde68a",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "12px",
    lineHeight: 1.5,
  },
  temaLabel: { fontWeight: 700, color: "#92400e" },
  temaTexto: { fontWeight: 600, color: "#92400e", textTransform: "capitalize" },
  temaAviso: { color: "#a16207" },
  startBtn: {
    padding: "12px 24px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 4px 14px rgba(46, 125, 72, 0.25)",
    alignSelf: "flex-start",
  },
}
