import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import AudioRecorder from "../components/teacher/AudioRecorder"
import SessionPlanForm, { type SessionPlanData } from "../components/teacher/SessionPlanForm"
import SessionPlanPdf from "../components/teacher/SessionPlanPdf"
import StudentGroupings from "../components/teacher/StudentGroupings"
import VapiAssistant from "../components/teacher/VapiAssistant"
import type { User } from "../App"

interface DocenteModuleProps {
  user: User
  onBackToDashboard?: () => void
}

type TabKey = "aula" | "plan_form" | "plan_pdf" | "grouping"

export default function DocenteModule({ user, onBackToDashboard }: DocenteModuleProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("aula")

  const planesGuardados = useQuery(api.functions.plans.listPlansByAuthor, {
    autorEmail: user.email,
  })
  const savePlan = useMutation(api.functions.plans.savePlan)

  // Plan que se está editando. Null significa "uno nuevo": el formulario
  // arranca con sus valores por defecto.
  const [planId, setPlanId] = useState<Id<"session_plans"> | null>(null)
  const [planEditado, setPlanEditado] = useState<SessionPlanData | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [planError, setPlanError] = useState("")

  // El plan mostrado sale, en orden: de lo que el docente acaba de editar, del
  // plan seleccionado en la base, o de los valores por defecto del formulario.
  const planSeleccionado = planId
    ? planesGuardados?.find((p) => p._id === planId)
    : undefined

  const sessionPlan: SessionPlanData | undefined =
    planEditado ??
    (planSeleccionado
      ? {
          titulo: planSeleccionado.titulo,
          curso: planSeleccionado.curso,
          grado: planSeleccionado.grado,
          duracion: planSeleccionado.duracion,
          fecha: planSeleccionado.fecha,
          proposito: planSeleccionado.proposito,
          inicioActividades: planSeleccionado.inicioActividades,
          desarrolloActividades: planSeleccionado.desarrolloActividades,
          cierreActividades: planSeleccionado.cierreActividades,
          evaluacionEstrategia: planSeleccionado.evaluacionEstrategia,
          materialesRequeridos: planSeleccionado.materialesRequeridos,
        }
      : undefined)

  const handleFormSubmit = async (data: SessionPlanData) => {
    setPlanError("")
    setGuardando(true)
    try {
      const id = await savePlan({
        planId: planId ?? undefined,
        autorEmail: user.email,
        ...data,
      })
      setPlanId(id)
      setPlanEditado(data)
      setActiveTab("plan_pdf")
    } catch (error) {
      console.error("No se pudo guardar el plan:", error)
      setPlanError(
        error instanceof Error ? error.message : "No se pudo guardar el plan."
      )
    } finally {
      setGuardando(false)
    }
  }

  const handleNuevoPlan = () => {
    setPlanId(null)
    setPlanEditado(null)
    setActiveTab("plan_form")
  }

  const handleAbrirPlan = (id: Id<"session_plans">) => {
    setPlanId(id)
    setPlanEditado(null)
    setActiveTab("plan_form")
  }

  return (
    <div style={styles.container}>
      {/* Top Navbar */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          {onBackToDashboard && (
            <button onClick={onBackToDashboard} style={styles.backBtn}>
              ← Volver
            </button>
          )}
          <div style={styles.logoBadge}>
            <img src="/logEddukko-solo.png" alt="KoEduko" style={styles.logoImg} />
          </div>
          <div>
            <h1 style={styles.title}>Módulo Docente — KoEduko</h1>
            <p style={styles.subTitle}>Asistente de Aula Inteligente & Planificación P2P</p>
          </div>
        </div>

        <div style={styles.badgePill}>
          <span style={styles.badgeDot} />
          <span>Vista del Profesor</span>
        </div>
      </header>

      {/* Main Container */}
      <main style={styles.main}>
        {/* Navigation Tabs */}
        <nav style={styles.tabsNav}>
          <button
            onClick={() => setActiveTab("aula")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "aula" ? styles.activeTabBtn : {}),
            }}
          >
            🎙️ 1. Sesiones y Aula
          </button>

          <button
            onClick={() => setActiveTab("plan_form")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "plan_form" ? styles.activeTabBtn : {}),
            }}
          >
            📝 2. Plan de Sesión
          </button>

          <button
            onClick={() => setActiveTab("plan_pdf")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "plan_pdf" ? styles.activeTabBtn : {}),
            }}
          >
            📄 3. Documento PDF
          </button>

          <button
            onClick={() => setActiveTab("grouping")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "grouping" ? styles.activeTabBtn : {}),
            }}
          >
            👥 4. Agrupación Peer
          </button>
        </nav>

        {/* Dynamic Content Views */}
        <div style={styles.contentArea}>
          {activeTab === "aula" && (
            <>
              <VapiAssistant userEmail={user.email} userName={user.nombre} />
              <AudioRecorder userEmail={user.email} />
            </>
          )}

          {activeTab === "plan_form" && (
            <>
              <PlanesGuardados
                planes={planesGuardados}
                planIdActivo={planId}
                onAbrir={handleAbrirPlan}
                onNuevo={handleNuevoPlan}
              />
              {planError && <div style={styles.planError}>⚠️ {planError}</div>}
              {guardando && (
                <div style={styles.planStatus}>Guardando en Convex...</div>
              )}
              <SessionPlanForm
                // Remontar al cambiar de plan: el formulario copia initialData a
                // su estado local solo al montarse, así que sin esto seguiría
                // mostrando el plan anterior.
                key={planId ?? "nuevo"}
                initialData={sessionPlan}
                onSubmit={handleFormSubmit}
              />
            </>
          )}

          {activeTab === "plan_pdf" &&
            (sessionPlan ? (
              <SessionPlanPdf
                planData={sessionPlan}
                onEdit={() => setActiveTab("plan_form")}
              />
            ) : (
              <div style={styles.emptyPlanBox}>
                <p style={styles.emptyPlanTitle}>Todavía no hay un plan cargado</p>
                <p style={styles.emptyPlanDesc}>
                  Completá el formulario en "2. Plan de Sesión" para generar el
                  documento.
                </p>
                <button onClick={handleNuevoPlan} style={styles.emptyPlanBtn}>
                  Crear un plan
                </button>
              </div>
            ))}

          {activeTab === "grouping" && <StudentGroupings />}
        </div>
      </main>
    </div>
  )
}

interface PlanResumen {
  _id: Id<"session_plans">
  titulo: string
  curso: string
  fecha: string
  updatedAt: number
}

interface PlanesGuardadosProps {
  planes: PlanResumen[] | undefined
  planIdActivo: Id<"session_plans"> | null
  onAbrir: (id: Id<"session_plans">) => void
  onNuevo: () => void
}

/**
 * Planes ya guardados del docente. Se listan siempre, también cuando está
 * vacío, para que quede claro que los planes ahora se persisten.
 */
function PlanesGuardados({
  planes,
  planIdActivo,
  onAbrir,
  onNuevo,
}: PlanesGuardadosProps) {
  if (planes === undefined) {
    return (
      <div style={styles.plansBar}>
        <span style={styles.plansLabel}>Cargando planes guardados...</span>
      </div>
    )
  }

  return (
    <div style={styles.plansBar}>
      <div style={styles.plansHeader}>
        <span style={styles.plansLabel}>
          {planes.length === 0
            ? "No tenés planes guardados todavía"
            : `Tus planes guardados (${planes.length})`}
        </span>
        <button onClick={onNuevo} style={styles.newPlanBtn}>
          + Nuevo plan
        </button>
      </div>

      {planes.length > 0 && (
        <div style={styles.plansList}>
          {planes.map((plan) => {
            const activo = plan._id === planIdActivo
            return (
              <button
                key={plan._id}
                onClick={() => onAbrir(plan._id)}
                style={{
                  ...styles.planChip,
                  ...(activo ? styles.planChipActive : {}),
                }}
              >
                <span style={styles.planChipTitle}>{plan.titulo}</span>
                <span style={styles.planChipMeta}>
                  {plan.curso} · {plan.fecha}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f7f9f7",
    display: "flex",
    flexDirection: "column",
  },
  plansBar: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "18px 20px",
    border: "1px solid #eef2ef",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  plansHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  plansLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#64748b",
  },
  newPlanBtn: {
    padding: "8px 16px",
    backgroundColor: "#f0f7f2",
    color: "#2e7d48",
    border: "1px solid #c8e6d0",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  plansList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  planChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "8px 14px",
    backgroundColor: "#f8faf8",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "left",
  },
  planChipActive: {
    backgroundColor: "#eaf5ed",
    border: "1px solid #2e7d48",
  },
  planChipTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#1e293b",
  },
  planChipMeta: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  planStatus: {
    fontSize: "13px",
    color: "#2e7d48",
    backgroundColor: "#eaf5ed",
    padding: "10px 14px",
    borderRadius: "10px",
  },
  planError: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
  },
  emptyPlanBox: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "40px 28px",
    border: "1px solid #eef2ef",
    textAlign: "center" as const,
  },
  emptyPlanTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 6px 0",
  },
  emptyPlanDesc: {
    fontSize: "13px",
    color: "#64748b",
    margin: "0 0 18px 0",
  },
  emptyPlanBtn: {
    padding: "12px 24px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  navbar: {
    height: "72px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #eef2ef",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  backBtn: {
    padding: "6px 12px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
  },
  logoBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#f0f7f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    border: "1px solid #e1efe5",
  },
  logoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  title: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#1e293b",
    margin: 0,
    lineHeight: 1.2,
  },
  subTitle: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
  },
  badgePill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 14px",
    backgroundColor: "#eaf5ed",
    color: "#2e7d48",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
  },
  badgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2e7d48",
  },
  main: {
    maxWidth: "1100px",
    width: "100%",
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  tabsNav: {
    display: "flex",
    gap: "8px",
    backgroundColor: "#ffffff",
    padding: "8px",
    borderRadius: "16px",
    border: "1px solid #eef2ef",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
    overflowX: "auto" as const,
  },
  tabBtn: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "transparent",
    color: "#64748b",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
    transition: "all 0.2s ease",
  },
  activeTabBtn: {
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(46, 125, 72, 0.2)",
  },
  contentArea: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
}
