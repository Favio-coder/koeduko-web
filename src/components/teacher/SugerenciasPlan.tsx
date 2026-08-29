import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"

/**
 * Qué reforzar en la próxima clase, según lo que la IA detectó en las sesiones
 * ya analizadas.
 *
 * Cierra el circuito escuchar → analizar → planificar: el docente ve por dónde
 * empezar sin releer los reportes uno por uno.
 */
export default function SugerenciasPlan() {
  const sugerencias = useQuery(api.functions.plans.sugerenciasParaPlan)

  // Mientras carga no se muestra nada: un bloque vacío que aparece y desaparece
  // sobre el formulario distrae más de lo que informa.
  if (!sugerencias) return null

  const { conceptos, estudiantesEnRefuerzo, sesionesAnalizadas } = sugerencias

  if (sesionesAnalizadas === 0 || conceptos.length === 0) {
    return (
      <div style={styles.card}>
        <h4 style={styles.title}>💡 Sugerencias para el plan</h4>
        <p style={styles.empty}>
          Todavía no hay sesiones analizadas. Cuando corras una sesión con el
          asistente, acá vas a ver qué conceptos conviene reforzar.
        </p>
      </div>
    )
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h4 style={styles.title}>💡 Sugerencias para el plan</h4>
        <span style={styles.badge}>
          {sesionesAnalizadas} {sesionesAnalizadas === 1 ? "sesión" : "sesiones"}{" "}
          analizadas
        </span>
      </div>

      <div>
        <span style={styles.label}>Conceptos que conviene reforzar:</span>
        <div style={styles.chips}>
          {conceptos.map((c) => (
            <span key={c.concepto} style={styles.chip}>
              {c.concepto}
              <span style={styles.count}>
                {c.estudiantes} {c.estudiantes === 1 ? "alumno" : "alumnos"}
              </span>
            </span>
          ))}
        </div>
      </div>

      {estudiantesEnRefuerzo.length > 0 && (
        <div>
          <span style={styles.label}>Estudiantes que necesitan apoyo:</span>
          <div style={styles.chips}>
            {estudiantesEnRefuerzo.map((e) => (
              <span key={e.nombre} style={styles.studentChip}>
                {e.nombre}
                <span style={styles.count}>{e.avgQuality}/10</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <p style={styles.hint}>
        Sale de los reportes que la IA generó a partir de las sesiones. Copialo
        al propósito o a las actividades del plan.
      </p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid #c8e6d0",
    boxShadow: "0 2px 10px rgba(46, 125, 72, 0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  title: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  badge: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#2e7d48",
    backgroundColor: "#eaf5ed",
    padding: "4px 10px",
    borderRadius: "10px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    display: "block",
    marginBottom: "8px",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#92400e",
    backgroundColor: "#fef3c7",
    padding: "6px 12px",
    borderRadius: "10px",
    textTransform: "capitalize",
  },
  studentChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    padding: "6px 12px",
    borderRadius: "10px",
  },
  count: {
    fontSize: "11px",
    fontWeight: 500,
    opacity: 0.75,
  },
  empty: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
    lineHeight: 1.5,
  },
  hint: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: 0,
  },
}
