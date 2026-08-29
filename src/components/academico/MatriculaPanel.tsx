import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { panel } from "./panelStyles"

interface MatriculaPanelProps {
  cursoId: Id<"curso">
}

export default function MatriculaPanel({ cursoId }: MatriculaPanelProps) {
  const matriculas = useQuery(api.matricula.listarPorCurso, { c_curso: cursoId })
  const usuarios = useQuery(api.usuario.listar)
  const crearMatricula = useMutation(api.matricula.crear)
  const eliminarMatricula = useMutation(api.matricula.eliminar)

  const [abierto, setAbierto] = useState(false)
  const [usuarioId, setUsuarioId] = useState<Id<"usuario"> | "">("")
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")

  // Un estudiante ya matriculado no vuelve a ofrecerse: matricularlo dos veces
  // duplicaría la fila y lo contaría dos veces en el curso.
  const yaMatriculados = new Set(
    matriculas?.map((m) => m.estudiante?.id).filter(Boolean)
  )
  const disponibles = usuarios?.filter((u) => !yaMatriculados.has(u._id)) ?? []

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuarioId) {
      setError("Elegí un estudiante.")
      return
    }

    const usuario = usuarios?.find((u) => u._id === usuarioId)

    setGuardando(true)
    setError("")
    try {
      await crearMatricula({
        c_curso: cursoId,
        c_usuario: usuarioId,
        nombre: usuario?.nombre ?? "Matrícula",
      })
      setUsuarioId("")
      setAbierto(false)
    } catch (err) {
      console.error("No se pudo matricular:", err)
      setError(err instanceof Error ? err.message : "No se pudo matricular.")
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (id: Id<"matricula">) => {
    try {
      await eliminarMatricula({ id })
    } catch (err) {
      console.error("No se pudo quitar la matrícula:", err)
      setError(
        err instanceof Error ? err.message : "No se pudo quitar la matrícula."
      )
    }
  }

  return (
    <section style={panel.card}>
      <div style={panel.header}>
        <div>
          <h3 style={panel.title}>🎓 Estudiantes matriculados</h3>
          <p style={panel.subtitle}>Quiénes cursan esta materia</p>
        </div>
        <button
          onClick={() => setAbierto((v) => !v)}
          disabled={disponibles.length === 0}
          style={{
            ...panel.addBtn,
            opacity: disponibles.length === 0 ? 0.5 : 1,
            cursor: disponibles.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {abierto ? "Cancelar" : "+ Matricular"}
        </button>
      </div>

      {usuarios !== undefined && disponibles.length === 0 && (
        <div style={panel.warnBox}>
          Todos los usuarios registrados ya están matriculados en este curso.
        </div>
      )}

      {abierto && (
        <form onSubmit={handleCrear} style={panel.form}>
          <select
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value as Id<"usuario">)}
            style={panel.input}
          >
            <option value="">Elegí un estudiante...</option>
            {disponibles.map((u) => (
              <option key={u._id} value={u._id}>
                {u.nombre} — {u.email}
              </option>
            ))}
          </select>
          <button type="submit" disabled={guardando} style={panel.submitBtn}>
            {guardando ? "Matriculando..." : "Matricular"}
          </button>
        </form>
      )}

      {error && <div style={panel.errorBox}>⚠️ {error}</div>}

      {matriculas === undefined ? (
        <p style={panel.muted}>Cargando matrículas...</p>
      ) : matriculas.length === 0 ? (
        <p style={panel.muted}>Todavía no hay estudiantes matriculados.</p>
      ) : (
        <div style={panel.list}>
          {matriculas.map((matricula) => (
            <div key={matricula.id} style={panel.rowStatic}>
              <div>
                <span style={panel.rowTitle}>
                  {matricula.estudiante?.nombre ?? "Usuario eliminado"}
                </span>
                <br />
                <span style={panel.rowMeta}>
                  {matricula.estudiante?.email ?? "—"}
                </span>
              </div>
              <button
                onClick={() => handleEliminar(matricula.id)}
                style={panel.deleteBtn}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
