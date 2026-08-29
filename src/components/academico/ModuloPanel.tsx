import { useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { panel } from "./panelStyles"

interface Modulo {
  _id: Id<"modulos">
  nombre: string
  desc: string
  orden: number
}

interface ModuloPanelProps {
  cursoId: Id<"curso">
  modulos: Modulo[] | undefined
  moduloIdActivo: Id<"modulos"> | null
  onSeleccionar: (id: Id<"modulos">) => void
  onCrear: (args: {
    nombre: string
    desc: string
    orden: number
    c_curso: Id<"curso">
  }) => Promise<unknown>
}

export default function ModuloPanel({
  cursoId,
  modulos,
  moduloIdActivo,
  onSeleccionar,
  onCrear,
}: ModuloPanelProps) {
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState("")
  const [desc, setDesc] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.")
      return
    }

    setGuardando(true)
    setError("")
    try {
      // El orden se calcula sobre los módulos existentes en vez de pedirlo:
      // dejarlo a mano invita a números repetidos que rompen la secuencia.
      const siguienteOrden = (modulos?.length ?? 0) + 1

      await onCrear({
        nombre: nombre.trim(),
        desc: desc.trim(),
        orden: siguienteOrden,
        c_curso: cursoId,
      })
      setNombre("")
      setDesc("")
      setAbierto(false)
    } catch (err) {
      console.error("No se pudo crear el módulo:", err)
      setError(err instanceof Error ? err.message : "No se pudo crear el módulo.")
    } finally {
      setGuardando(false)
    }
  }

  const ordenados = modulos ? [...modulos].sort((a, b) => a.orden - b.orden) : undefined

  return (
    <section style={panel.card}>
      <div style={panel.header}>
        <div>
          <h3 style={panel.title}>🧩 Módulos del curso</h3>
          <p style={panel.subtitle}>
            Elegí un módulo para gestionar sus materiales
          </p>
        </div>
        <button onClick={() => setAbierto((v) => !v)} style={panel.addBtn}>
          {abierto ? "Cancelar" : "+ Nuevo módulo"}
        </button>
      </div>

      {abierto && (
        <form onSubmit={handleCrear} style={panel.form}>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del módulo"
            style={panel.input}
          />
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descripción"
            style={panel.input}
          />
          <button type="submit" disabled={guardando} style={panel.submitBtn}>
            {guardando ? "Creando..." : "Crear módulo"}
          </button>
        </form>
      )}

      {error && <div style={panel.errorBox}>⚠️ {error}</div>}

      {ordenados === undefined ? (
        <p style={panel.muted}>Cargando módulos...</p>
      ) : ordenados.length === 0 ? (
        <p style={panel.muted}>Este curso todavía no tiene módulos.</p>
      ) : (
        <div style={panel.list}>
          {ordenados.map((modulo) => {
            const activo = modulo._id === moduloIdActivo
            return (
              <button
                key={modulo._id}
                onClick={() => onSeleccionar(modulo._id)}
                style={{ ...panel.row, ...(activo ? panel.rowActive : {}) }}
              >
                <span style={panel.rowTitle}>
                  {modulo.orden}. {modulo.nombre}
                </span>
                <span style={panel.rowMeta}>{modulo.desc}</span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
