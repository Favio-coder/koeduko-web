import { useState } from "react"
import AudioRecorder from "../components/teacher/AudioRecorder"
import SessionPlanForm, { type SessionPlanData } from "../components/teacher/SessionPlanForm"
import SessionPlanPdf from "../components/teacher/SessionPlanPdf"
import StudentGroupings from "../components/teacher/StudentGroupings"

interface DocenteModuleProps {
  onBackToDashboard?: () => void
}

type TabKey = "audio" | "plan_form" | "plan_pdf" | "grouping"

export default function DocenteModule({ onBackToDashboard }: DocenteModuleProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("audio")

  // Session plan state
  const [sessionPlan, setSessionPlan] = useState<SessionPlanData>({
    titulo: "Introducción a Algoritmos y Estructura de Datos",
    curso: "Programación Orientada a Objetos",
    grado: "Universitario - Ciclo III",
    duracion: "90 minutos",
    fecha: new Date().toISOString().split("T")[0],
    proposito:
      "Comprender la diferencia entre estructuras lineales y no lineales, aplicándolas en resolución de problemas en equipo.",
    inicioActividades:
      "15 min: Análisis del audio grabado en clase para identificar dudas comunes sobre 'if/else' y activación de conocimientos.",
    desarrolloActividades:
      "50 min: Ejercicios guiados en pares heterogéneos (agrupación inteligente). Resolución de 3 casos prácticos en laboratorio.",
    cierreActividades:
      "25 min: Quiz interactivo en equipo y resumen colaborativo en pizarra virtual.",
    evaluacionEstrategia:
      "Rúbrica de evaluación entre pares y verificación de código resuelto en grupo.",
    materialesRequeridos:
      "Proyector, laptops con IDE de desarrollo, guías impresas y plataforma KoEduko.",
  })

  const handleFormSubmit = (data: SessionPlanData) => {
    setSessionPlan(data)
    setActiveTab("plan_pdf")
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
            onClick={() => setActiveTab("audio")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "audio" ? styles.activeTabBtn : {}),
            }}
          >
            🎙️ 1. Escuchar Salón
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
          {activeTab === "audio" && (
            <AudioRecorder
              onAnalysisComplete={() => {
                // Auto prompt to proceed to session plan
              }}
            />
          )}

          {activeTab === "plan_form" && (
            <SessionPlanForm
              initialData={sessionPlan}
              onSubmit={handleFormSubmit}
            />
          )}

          {activeTab === "plan_pdf" && (
            <SessionPlanPdf
              planData={sessionPlan}
              onEdit={() => setActiveTab("plan_form")}
            />
          )}

          {activeTab === "grouping" && <StudentGroupings />}
        </div>
      </main>
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
