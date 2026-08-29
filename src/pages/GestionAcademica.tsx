import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import type { User } from "../App"
import CursoPanel from "../components/academico/CursoPanel"
import ModuloPanel from "../components/academico/ModuloPanel"
import MaterialPanel from "../components/academico/MaterialPanel"
import MatriculaPanel from "../components/academico/MatriculaPanel"
import PersonasPanel from "../components/academico/PersonasPanel"

interface GestionAcademicaProps {
  user: User
  onBackToDashboard?: () => void
}

/**
 * Gestión del contenido académico: cursos, sus módulos, los materiales de cada
 * módulo y los estudiantes matriculados.
 *
 * La navegación es jerárquica porque los datos lo son: un módulo no existe sin
 * curso y un material no existe sin módulo. Elegir primero el padre evita
 * formularios que piden un id que el docente no tiene a mano.
 */
export default function GestionAcademica({
  user,
  onBackToDashboard,
}: GestionAcademicaProps) {
  const [cursoId, setCursoId] = useState<Id<"curso"> | null>(null)
  const [moduloId, setModuloId] = useState<Id<"modulos"> | null>(null)

  const cursos = useQuery(api.curso.listar)
  const instrucciones = useQuery(api.instruccion.listar)
  const modulos = useQuery(
    api.modulos.listarPorCurso,
    cursoId ? { c_curso: cursoId } : "skip"
  )

  const crearCurso = useMutation(api.curso.crear)
  const crearModulo = useMutation(api.modulos.crear)

  const cursoActivo = cursos?.find((c) => c._id === cursoId) ?? null
  const moduloActivo = modulos?.find((m) => m._id === moduloId) ?? null

  const handleSeleccionarCurso = (id: Id<"curso">) => {
    setCursoId(id)
    // El módulo pertenece al curso anterior: mantenerlo mostraría materiales
    // de un módulo que ya no está en pantalla.
    setModuloId(null)
  }

  return (
    <div style={styles.container}>
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
            <h1 style={styles.title}>Gestión Académica — KoEduko</h1>
            <p style={styles.subTitle}>Cursos, módulos, materiales y matrículas</p>
          </div>
        </div>

        <div style={styles.badgePill}>
          <span style={styles.badgeDot} />
          <span>{user.nombre}</span>
        </div>
      </header>

      <main style={styles.main}>
        {/* Migas de pan: dejan claro en qué nivel de la jerarquía se está */}
        <nav style={styles.breadcrumb}>
          <button
            onClick={() => {
              setCursoId(null)
              setModuloId(null)
            }}
            style={{
              ...styles.crumb,
              ...(cursoId === null ? styles.crumbActive : {}),
            }}
          >
            📚 Cursos
          </button>

          {cursoActivo && (
            <>
              <span style={styles.crumbSep}>›</span>
              <button
                onClick={() => setModuloId(null)}
                style={{
                  ...styles.crumb,
                  ...(moduloId === null ? styles.crumbActive : {}),
                }}
              >
                {cursoActivo.nombre}
              </button>
            </>
          )}

          {moduloActivo && (
            <>
              <span style={styles.crumbSep}>›</span>
              <span style={{ ...styles.crumb, ...styles.crumbActive }}>
                {moduloActivo.nombre}
              </span>
            </>
          )}
        </nav>

        <div style={styles.content}>
          <CursoPanel
            cursos={cursos}
            instrucciones={instrucciones}
            cursoIdActivo={cursoId}
            onSeleccionar={handleSeleccionarCurso}
            onCrear={crearCurso}
          />

          {cursoId && (
            <>
              <ModuloPanel
                cursoId={cursoId}
                modulos={modulos}
                moduloIdActivo={moduloId}
                onSeleccionar={setModuloId}
                onCrear={crearModulo}
              />

              <MatriculaPanel cursoId={cursoId} />
            </>
          )}

          {moduloId && (
            <MaterialPanel moduloId={moduloId} userEmail={user.email} />
          )}

          {/* Al final: es la base de todo lo demás, pero se consulta menos que
              los cursos una vez que la gente ya está cargada. */}
          <PersonasPanel />
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
    cursor: "pointer",
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
    gap: "20px",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    backgroundColor: "#ffffff",
    padding: "12px 18px",
    borderRadius: "14px",
    border: "1px solid #eef2ef",
  },
  crumb: {
    padding: "6px 12px",
    backgroundColor: "transparent",
    color: "#64748b",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  crumbActive: {
    backgroundColor: "#eaf5ed",
    color: "#2e7d48",
  },
  crumbSep: {
    color: "#cbd5e1",
    fontSize: "14px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
}
