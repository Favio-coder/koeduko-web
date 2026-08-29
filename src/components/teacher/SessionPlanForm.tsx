import { useState } from "react"

export interface SessionPlanData {
  titulo: string
  curso: string
  grado: string
  duracion: string
  fecha: string
  proposito: string
  inicioActividades: string
  desarrolloActividades: string
  cierreActividades: string
  evaluacionEstrategia: string
  materialesRequeridos: string
}

interface SessionPlanFormProps {
  initialData?: Partial<SessionPlanData>
  onSubmit: (data: SessionPlanData) => void
}

export default function SessionPlanForm({ initialData, onSubmit }: SessionPlanFormProps) {
  const [formData, setFormData] = useState<SessionPlanData>({
    titulo: initialData?.titulo || "Introducción a Algoritmos y Estructura de Datos",
    curso: initialData?.curso || "Programación Orientada a Objetos",
    grado: initialData?.grado || "Universitario - Ciclo III",
    duracion: initialData?.duracion || "90 minutos",
    fecha: initialData?.fecha || new Date().toISOString().split("T")[0],
    proposito:
      initialData?.proposito ||
      "Comprender la diferencia entre estructuras lineales y no lineales, aplicándolas en resolución de problemas en equipo.",
    inicioActividades:
      initialData?.inicioActividades ||
      "Lluvia de ideas basada en el audio del aula. Preguntas exploratorias sobre variables y colecciones.",
    desarrolloActividades:
      initialData?.desarrolloActividades ||
      "Exposición dialogada de 20 min. Trabajo peer-to-peer en parejas (estudiante avanzado + refuerzo) para resolver reto práctico.",
    cierreActividades:
      initialData?.cierreActividades ||
      "Presentación breve del vocero de cada grupo. Reflexión metacognitiva: ¿Qué aprendí hoy y cómo lo aplicaré?",
    evaluacionEstrategia:
      initialData?.evaluacionEstrategia ||
      "Rúbrica de evaluación entre pares y verificación de código resuelto en grupo.",
    materialesRequeridos:
      initialData?.materialesRequeridos ||
      "Proyector, laptops con IDE de desarrollo, guías impresas y plataforma KoEduko.",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleFillDemo = () => {
    setFormData({
      titulo: "Estructuras de Control y Lógica de Programación",
      curso: "Fundamentos de Programación",
      grado: "Universitario - Ciclo I",
      duracion: "120 minutos",
      fecha: new Date().toISOString().split("T")[0],
      proposito:
        "Desarrollar la capacidad lógica para estructurar algoritmos condicionales mediante el trabajo colaborativo en pares.",
      inicioActividades:
        "15 min: Análisis del audio grabado en clase para identificar dudas comunes sobre 'if/else' y activación de conocimientos.",
      desarrolloActividades:
        "60 min: Ejercicios guiados en pares heterogéneos (agrupación inteligente). Resolución de 3 casos prácticos en laboratorio.",
      cierreActividades:
        "25 min: Quiz interactivo en equipo y resumen colaborativo en pizarra virtual.",
      evaluacionEstrategia:
        "Evaluación formativa continua, coevaluación entre pares y lista de cotejo.",
      materialesRequeridos:
        "Plataforma KoEduko, repositorio de ejercicios, guía didáctica digital.",
    })
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.iconBadge}>📝</div>
          <div>
            <h3 style={styles.title}>Diseño de Plan de Sesión de Aprendizaje</h3>
            <p style={styles.subtitle}>
              Responde las preguntas pedagógicas para generar el documento oficial en PDF
            </p>
          </div>
        </div>

        <button type="button" onClick={handleFillDemo} style={styles.demoBtn}>
          ✨ Cargar plantilla sugerida por IA
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Seccion 1: Datos Generales */}
        <div style={styles.sectionBox}>
          <h4 style={styles.sectionTitle}>📌 1. Datos Generales de la Sesión</h4>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Título / Tema de la Sesión</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Asignatura / Curso</label>
              <input
                type="text"
                name="curso"
                value={formData.curso}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Nivel / Grado</label>
              <input
                type="text"
                name="grado"
                value={formData.grado}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Duración Estimada</label>
              <input
                type="text"
                name="duracion"
                value={formData.duracion}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Seccion 2: Secuencia Didáctica */}
        <div style={styles.sectionBox}>
          <h4 style={styles.sectionTitle}>🎯 2. Propósito y Secuencia Didáctica</h4>

          <div style={styles.fieldFull}>
            <label style={styles.label}>¿Cuál es el propósito y objetivo de la sesión?</label>
            <textarea
              name="proposito"
              rows={3}
              value={formData.proposito}
              onChange={handleChange}
              required
              style={styles.textarea}
            />
          </div>

          <div style={styles.fieldFull}>
            <label style={styles.label}>
              🟢 Momento INICIO (Motivación y Recuperación de Saberes Previos)
            </label>
            <textarea
              name="inicioActividades"
              rows={3}
              value={formData.inicioActividades}
              onChange={handleChange}
              required
              style={styles.textarea}
            />
          </div>

          <div style={styles.fieldFull}>
            <label style={styles.label}>
              🔵 Momento DESARROLLO (Construcción del Aprendizaje y Trabajo en Pares)
            </label>
            <textarea
              name="desarrolloActividades"
              rows={3}
              value={formData.desarrolloActividades}
              onChange={handleChange}
              required
              style={styles.textarea}
            />
          </div>

          <div style={styles.fieldFull}>
            <label style={styles.label}>
              🔴 Momento CIERRE (Evaluación, Metacognición y Transferencia)
            </label>
            <textarea
              name="cierreActividades"
              rows={3}
              value={formData.cierreActividades}
              onChange={handleChange}
              required
              style={styles.textarea}
            />
          </div>
        </div>

        {/* Seccion 3: Evaluación y Recursos */}
        <div style={styles.sectionBox}>
          <h4 style={styles.sectionTitle}>⚙️ 3. Estrategia de Evaluación y Recursos</h4>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Estrategia de Evaluación / Rúbrica</label>
              <textarea
                name="evaluacionEstrategia"
                rows={2}
                value={formData.evaluacionEstrategia}
                onChange={handleChange}
                required
                style={styles.textarea}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Materiales y Recursos Educativos</label>
              <textarea
                name="materialesRequeridos"
                rows={2}
                value={formData.materialesRequeridos}
                onChange={handleChange}
                required
                style={styles.textarea}
              />
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <button type="submit" style={styles.submitBtn}>
            📄 Generar y Vista Previa del Plan de Sesión
          </button>
        </div>
      </form>
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
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
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
  demoBtn: {
    padding: "8px 16px",
    backgroundColor: "#f0f7f2",
    color: "#2e7d48",
    border: "1px solid #c8e6d0",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  sectionBox: {
    backgroundColor: "#f8faf8",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
    outline: "none",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "8px",
  },
  submitBtn: {
    padding: "14px 28px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 700,
    boxShadow: "0 4px 14px rgba(46, 125, 72, 0.25)",
  },
}
