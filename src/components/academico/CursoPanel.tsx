import { useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { panel } from "./panelStyles"

interface Curso {
  _id: Id<"curso">
  nombre: string
  desc: string
  c_grado: Id<"instruccion">
}

interface Instruccion {
  _id: Id<"instruccion">
  nombre: string
}

interface CursoPanelProps {
  cursos: Curso[] | undefined
  instrucciones: Instruccion[] | undefined
  cursoIdActivo: Id<"curso"> | null
  onSeleccionar: (id: Id<"curso">) => void
  onCrear: (args: {
    nombre: string
    desc: string
    c_grado: Id<"instruccion">
  }) => Promise<unknown>
}

export default function CursoPanel({
  cursos,
  instrucciones,
  cursoIdActivo,
  onSeleccionar,
  onCrear,
}: CursoPanelProps) {
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState("")
  const [desc, setDesc] = useState("")
  const [grado, setGrado] = useState<Id<"instruccion"> | "">("")
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !grado) {
      setError("El nombre y el nivel son obligatorios.")
      return
    }

    setGuardando(true)
    setError("")
    try {
      await onCrear({ nombre: nombre.trim(), desc: desc.trim(), c_grado: grado })
      setNombre("")
      setDesc("")
      setGrado("")
      setAbierto(false)
    } catch (err) {
      console.error("No se pudo crear el curso:", err)
      setError(err instanceof Error ? err.message : "No se pudo crear el curso.")
    } finally {
      setGuardando(false)
    }
  }

  // Un curso necesita un nivel de instrucción, así que sin niveles cargados el
  // formulario no puede completarse.
  const sinNiveles = instrucciones !== undefined && instrucciones.length === 0

  return (
    <section style={panel.card}>
      <div style={panel.header}>
        <div>
          <h3 style={panel.title}>📚 Cursos</h3>
          <p style={panel.subtitle}>
            Elegí un curso para ver sus módulos y estudiantes
          </p>
        </div>
        <button
          onClick={() => setAbierto((v) => !v)}
          disabled={sinNiveles}
          style={{
            ...panel.addBtn,
            opacity: sinNiveles ? 0.5 : 1,
            cursor: sinNiveles ? "not-allowed" : "pointer",
          }}
        >
          {abierto ? "Cancelar" : "+ Nuevo curso"}
        </button>
      </div>

      {sinNiveles && (
        <div style={panel.warnBox}>
          No hay niveles de instrucción cargados. Un curso necesita uno, así que
          primero hay que crear al menos un nivel.
        </div>
      )}

      {abierto && (
        <form onSubmit={handleCrear} style={panel.form}>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del curso"
            style={panel.input}
          />
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descripción"
            style={panel.input}
          />
          <select
            value={grado}
            onChange={(e) => setGrado(e.target.value as Id<"instruccion">)}
            style={panel.input}
          >
            <option value="">Nivel de instrucción...</option>
            {instrucciones?.map((i) => (
              <option key={i._id} value={i._id}>
                {i.nombre}
              </option>
            ))}
          </select>
          <button type="submit" disabled={guardando} style={panel.submitBtn}>
            {guardando ? "Creando..." : "Crear curso"}
          </button>
        </form>
      )}

      {error && <div style={panel.errorBox}>⚠️ {error}</div>}

      {cursos === undefined ? (
        <p style={panel.muted}>Cargando cursos...</p>
      ) : cursos.length === 0 ? (
        <p style={panel.muted}>Todavía no hay cursos creados.</p>
      ) : (
        <div style={panel.list}>
          {cursos.map((curso) => {
            const activo = curso._id === cursoIdActivo
            return (
              <button
                key={curso._id}
                onClick={() => onSeleccionar(curso._id)}
                style={{
                  ...panel.row,
                  ...(activo ? panel.rowActive : {}),
                }}
              >
                <span style={panel.rowTitle}>{curso.nombre}</span>
                <span style={panel.rowMeta}>{curso.desc}</span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
