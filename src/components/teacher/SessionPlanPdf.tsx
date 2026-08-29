import { useRef, useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import type { SessionPlanData } from "./SessionPlanForm"

interface SessionPlanPdfProps {
  planData: SessionPlanData
  onEdit?: () => void
}

export default function SessionPlanPdf({ planData, onEdit }: SessionPlanPdfProps) {
  const [downloading, setDownloading] = useState(false)
  const documentRef = useRef<HTMLDivElement>(null)

  const handleDownloadPdf = async () => {
    if (!documentRef.current) return
    setDownloading(true)
    try {
      const element = documentRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Plan_Sesion_${planData.titulo.replace(/\s+/g, "_")}.pdf`)
    } catch (err) {
      console.error("Error al generar PDF:", err)
      alert("Ocurrió un error al generar el PDF.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Action Bar */}
      <div style={styles.actionBar}>
        <div style={styles.badgeGroup}>
          <span style={styles.pdfBadge}>📄 PDF Listo</span>
          <span style={styles.planTitleText}>{planData.titulo}</span>
        </div>

        <div style={styles.actionButtons}>
          {onEdit && (
            <button onClick={onEdit} style={styles.editBtn}>
              ✏️ Editar Datos
            </button>
          )}
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            style={{
              ...styles.downloadBtn,
              opacity: downloading ? 0.7 : 1,
            }}
          >
            {downloading ? "Generando PDF..." : "📥 Descargar Plan en PDF"}
          </button>
        </div>
      </div>

      {/* Official PDF Document Container (Rendered to canvas on download) */}
      <div ref={documentRef} style={styles.pdfPaper}>
        {/* Header */}
        <div style={styles.docHeader}>
          <div style={styles.docBrand}>
            <span style={styles.docLogoIcon}>🟢</span>
            <div>
              <h1 style={styles.docTitle}>PLAN DE SESIÓN DE APRENDIZAJE</h1>
              <p style={styles.docSub}>Plataforma Educativa Peer-to-Peer KoEduko</p>
            </div>
          </div>
          <div style={styles.docMetaRight}>
            <span style={styles.docMetaLabel}>Fecha: {planData.fecha}</span>
            <span style={styles.docMetaLabel}>Duración: {planData.duracion}</span>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Informacion General Table */}
        <div style={styles.sectionHeader}>
          <h3>I. INFORMACIÓN GENERAL</h3>
        </div>

        <table style={styles.docTable}>
          <tbody>
            <tr>
              <td style={styles.tableLabelCell}>Tema / Sesión:</td>
              <td style={styles.tableValueCell}>
                <strong>{planData.titulo}</strong>
              </td>
            </tr>
            <tr>
              <td style={styles.tableLabelCell}>Asignatura / Curso:</td>
              <td style={styles.tableValueCell}>{planData.curso}</td>
            </tr>
            <tr>
              <td style={styles.tableLabelCell}>Nivel / Grado:</td>
              <td style={styles.tableValueCell}>{planData.grado}</td>
            </tr>
          </tbody>
        </table>

        {/* Proposito */}
        <div style={styles.sectionHeader}>
          <h3>II. PROPÓSITO DE APRENDIZAJE</h3>
        </div>
        <div style={styles.boxContent}>
          <p>{planData.proposito}</p>
        </div>

        {/* Secuencia Didactica */}
        <div style={styles.sectionHeader}>
          <h3>III. SECUENCIA DIDÁCTICA Y METODOLOGÍA PEER-TO-PEER</h3>
        </div>

        <div style={styles.sequenceGrid}>
          <div style={styles.stepCard}>
            <div style={{ ...styles.stepBadge, backgroundColor: "#eaf5ed", color: "#2e7d48" }}>
              🟢 1. INICIO (Motivación y Saberes Previos)
            </div>
            <p style={styles.stepText}>{planData.inicioActividades}</p>
          </div>

          <div style={styles.stepCard}>
            <div style={{ ...styles.stepBadge, backgroundColor: "#e0f2fe", color: "#0369a1" }}>
              🔵 2. DESARROLLO (Trabajo Colaborativo en Pares)
            </div>
            <p style={styles.stepText}>{planData.desarrolloActividades}</p>
          </div>

          <div style={styles.stepCard}>
            <div style={{ ...styles.stepBadge, backgroundColor: "#fee2e2", color: "#b91c1c" }}>
              🔴 3. CIERRE (Evaluación y Metacognición)
            </div>
            <p style={styles.stepText}>{planData.cierreActividades}</p>
          </div>
        </div>

        {/* Evaluacion y Recursos */}
        <div style={styles.sectionHeader}>
          <h3>IV. EVALUACIÓN Y RECURSOS DIDÁCTICOS</h3>
        </div>

        <table style={styles.docTable}>
          <tbody>
            <tr>
              <td style={styles.tableLabelCell}>Técnicas de Evaluación:</td>
              <td style={styles.tableValueCell}>{planData.evaluacionEstrategia}</td>
            </tr>
            <tr>
              <td style={styles.tableLabelCell}>Materiales y Recursos:</td>
              <td style={styles.tableValueCell}>{planData.materialesRequeridos}</td>
            </tr>
          </tbody>
        </table>

        {/* Signatures Footer */}
        <div style={styles.signatureArea}>
          <div style={styles.signatureLine}>
            <span>Firma del Docente</span>
          </div>
          <div style={styles.signatureLine}>
            <span>Coordinación Académica</span>
          </div>
        </div>

        <div style={styles.docFooterNotice}>
          <span>Generado automáticamente mediante KoEduko • Sistema de Gestión de Aprendizaje P2P</span>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  actionBar: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "16px 24px",
    border: "1px solid #eef2ef",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
  },
  badgeGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  pdfBadge: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#2e7d48",
    backgroundColor: "#eaf5ed",
    padding: "4px 10px",
    borderRadius: "12px",
  },
  planTitleText: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1e293b",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
  },
  editBtn: {
    padding: "10px 18px",
    backgroundColor: "#ffffff",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
  },
  downloadBtn: {
    padding: "10px 20px",
    backgroundColor: "#2e7d48",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(46, 125, 72, 0.2)",
  },
  pdfPaper: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "40px",
    border: "1px solid #cbd5e1",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
    fontFamily: "'Segoe UI', Roboto, Helvetica, sans-serif",
    color: "#1e293b",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  docHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  docBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  docLogoIcon: {
    fontSize: "32px",
  },
  docTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1e293b",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  docSub: {
    fontSize: "12px",
    color: "#2e7d48",
    fontWeight: 600,
    margin: 0,
  },
  docMetaRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "2px",
  },
  docMetaLabel: {
    fontSize: "12px",
    color: "#64748b",
  },
  divider: {
    border: "none",
    borderTop: "2px solid #2e7d48",
    margin: "4px 0",
  },
  sectionHeader: {
    color: "#2e7d48",
    fontSize: "14px",
    fontWeight: 700,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "4px",
    marginTop: "8px",
  },
  docTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "13px",
  },
  tableLabelCell: {
    width: "25%",
    padding: "8px 12px",
    backgroundColor: "#f8faf8",
    fontWeight: 600,
    color: "#475569",
    border: "1px solid #e2e8f0",
  },
  tableValueCell: {
    padding: "8px 12px",
    border: "1px solid #e2e8f0",
    color: "#1e293b",
  },
  boxContent: {
    backgroundColor: "#f8faf8",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  sequenceGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  stepCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  stepBadge: {
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: 700,
  },
  stepText: {
    padding: "12px 16px",
    fontSize: "13px",
    lineHeight: 1.5,
    margin: 0,
    color: "#334155",
  },
  signatureArea: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "40px",
    paddingTop: "20px",
  },
  signatureLine: {
    width: "200px",
    borderTop: "1px solid #94a3b8",
    textAlign: "center" as const,
    fontSize: "12px",
    color: "#64748b",
    paddingTop: "6px",
  },
  docFooterNotice: {
    textAlign: "center" as const,
    fontSize: "10px",
    color: "#94a3b8",
    marginTop: "20px",
  },
}
