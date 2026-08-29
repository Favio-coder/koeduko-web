import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { panel } from "./panelStyles"

interface MaterialPanelProps {
  moduloId: Id<"modulos">
  userEmail: string
}

export default function MaterialPanel({ moduloId, userEmail }: MaterialPanelProps) {
  const materiales = useQuery(api.materiales.listarPorModulo, { c_mod: moduloId })
  const crearMaterial = useMutation(api.materiales.crear)
  const eliminarMaterial = useMutation(api.materiales.eliminar)

  const [abierto, setAbierto] = useState(false)
  const [desc, setDesc] = useState("")
  const [url, setUrl] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!desc.trim() || !url.trim()) {
      setError("La descripción y el enlace son obligatorios.")
      return
    }

    setGuardando(true)
    setError("")
    try {
      await crearMaterial({
        email: userEmail,
        desc: desc.trim(),
        url: url.trim(),
        c_mod: moduloId,
      })
      setDesc("")
      setUrl("")
      setAbierto(false)
    } catch (err) {
      console.error("No se pudo crear el material:", err)
      setError(
        err instanceof Error ? err.message : "No se pudo crear el material."
      )
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (id: Id<"materiales">) => {
    try {
      await eliminarMaterial({ id })
    } catch (err) {
      console.error("No se pudo eliminar el material:", err)
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el material."
      )
    }
  }

  return (
    <section style={panel.card}>
      <div style={panel.header}>
        <div>
          <h3 style={panel.title}>📎 Materiales del módulo</h3>
          <p style={panel.subtitle}>Recursos enlazados para los estudiantes</p>
        </div>
        <button onClick={() => setAbierto((v) => !v)} style={panel.addBtn}>
          {abierto ? "Cancelar" : "+ Nuevo material"}
        </button>
      </div>

      {abierto && (
        <form onSubmit={handleCrear} style={panel.form}>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descripción del material"
            style={panel.input}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            type="url"
            style={panel.input}
          />
          <button type="submit" disabled={guardando} style={panel.submitBtn}>
            {guardando ? "Guardando..." : "Agregar material"}
          </button>
        </form>
      )}

      {error && <div style={panel.errorBox}>⚠️ {error}</div>}

      {materiales === undefined ? (
        <p style={panel.muted}>Cargando materiales...</p>
      ) : materiales.length === 0 ? (
        <p style={panel.muted}>Este módulo todavía no tiene materiales.</p>
      ) : (
        <div style={panel.list}>
          {materiales.map((material) => (
            <div key={material._id} style={panel.rowStatic}>
              <div>
                <span style={panel.rowTitle}>{material.desc}</span>
                <br />
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={panel.link}
                >
                  {material.url}
                </a>
              </div>
              <button
                onClick={() => handleEliminar(material._id)}
                style={panel.deleteBtn}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
