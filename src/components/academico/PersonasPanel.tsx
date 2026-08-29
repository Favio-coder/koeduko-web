import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { panel } from "./panelStyles"

/**
 * Alta y listado de usuarios, y de los niveles de instrucción que necesitan.
 *
 * Los dos van juntos porque se bloquean mutuamente: un usuario puede llevar
 * nivel y un curso lo exige, así que sin una forma de crearlos la única vía de
 * cargar gente era el seed.
 */
export default function PersonasPanel() {
  const usuarios = useQuery(api.usuario.listar)
  const roles = useQuery(api.roles.listar)
  const instrucciones = useQuery(api.instruccion.listar)

  const crearUsuario = useMutation(api.usuario.crear)
  const crearInstruccion = useMutation(api.instruccion.crear)

  const [abierto, setAbierto] = useState(false)
  const [nivelAbierto, setNivelAbierto] = useState(false)
  const [error, setError] = useState("")
  const [guardando, setGuardando] = useState(false)

  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [carrera, setCarrera] = useState("")
  const [genero, setGenero] = useState("femenino")
  const [rolId, setRolId] = useState<Id<"roles"> | "">("")
  const [nivelId, setNivelId] = useState<Id<"instruccion"> | "">("")

  const [nivelNombre, setNivelNombre] = useState("")
  const [nivelDesc, setNivelDesc] = useState("")

  const sinRoles = roles !== undefined && roles.length === 0

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !email.trim() || !rolId) {
      setError("Nombre, email y rol son obligatorios.")
      return
    }

    // El login busca por email, así que dos usuarios con el mismo email harían
    // que uno de los dos nunca pueda entrar.
    if (usuarios?.some((u) => u.email === email.trim())) {
      setError(`Ya existe un usuario con el email ${email.trim()}.`)
      return
    }

    setGuardando(true)
    setError("")
    try {
      await crearUsuario({
        nombre: nombre.trim(),
        email: email.trim(),
        carrera: carrera.trim(),
        genero,
        rol_id: rolId,
        es_st: nivelId || undefined,
      })
      setNombre("")
      setEmail("")
      setCarrera("")
      setRolId("")
      setNivelId("")
      setAbierto(false)
    } catch (err) {
      console.error("No se pudo crear el usuario:", err)
      setError(err instanceof Error ? err.message : "No se pudo crear el usuario.")
    } finally {
      setGuardando(false)
    }
  }

  const handleCrearNivel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nivelNombre.trim()) {
      setError("El nombre del nivel es obligatorio.")
      return
    }

    setGuardando(true)
    setError("")
    try {
      await crearInstruccion({
        nombre: nivelNombre.trim(),
        desc: nivelDesc.trim(),
      })
      setNivelNombre("")
      setNivelDesc("")
      setNivelAbierto(false)
    } catch (err) {
      console.error("No se pudo crear el nivel:", err)
      setError(err instanceof Error ? err.message : "No se pudo crear el nivel.")
    } finally {
      setGuardando(false)
    }
  }

  const nombreDeRol = (rol_id: Id<"roles">) =>
    roles?.find((r) => r._id === rol_id)?.nombre ?? "sin rol"

  return (
    <section style={panel.card}>
      <div style={panel.header}>
        <div>
          <h3 style={panel.title}>👤 Personas y niveles</h3>
          <p style={panel.subtitle}>
            Usuarios de la plataforma y niveles de instrucción
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => setNivelAbierto((v) => !v)} style={panel.addBtn}>
            {nivelAbierto ? "Cancelar" : "+ Nivel"}
          </button>
          <button
            onClick={() => setAbierto((v) => !v)}
            disabled={sinRoles}
            style={{
              ...panel.addBtn,
              opacity: sinRoles ? 0.5 : 1,
              cursor: sinRoles ? "not-allowed" : "pointer",
            }}
          >
            {abierto ? "Cancelar" : "+ Usuario"}
          </button>
        </div>
      </div>

      {sinRoles && (
        <div style={panel.warnBox}>
          No hay roles cargados. Un usuario necesita uno, así que primero hay que
          crear al menos un rol (por ejemplo "docente" y "estudiante").
        </div>
      )}

      {nivelAbierto && (
        <form onSubmit={handleCrearNivel} style={panel.form}>
          <input
            value={nivelNombre}
            onChange={(e) => setNivelNombre(e.target.value)}
            placeholder="Nombre del nivel (ej: Universitario)"
            style={panel.input}
          />
          <input
            value={nivelDesc}
            onChange={(e) => setNivelDesc(e.target.value)}
            placeholder="Descripción"
            style={panel.input}
          />
          <button type="submit" disabled={guardando} style={panel.submitBtn}>
            {guardando ? "Creando..." : "Crear nivel"}
          </button>
        </form>
      )}

      {abierto && (
        <form onSubmit={handleCrearUsuario} style={panel.form}>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            style={panel.input}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@koeduko.com"
            type="email"
            style={panel.input}
          />
          <input
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
            placeholder="Carrera o área"
            style={panel.input}
          />
          <select
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            style={panel.input}
          >
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
            <option value="otro">Otro</option>
          </select>
          <select
            value={rolId}
            onChange={(e) => setRolId(e.target.value as Id<"roles">)}
            style={panel.input}
          >
            <option value="">Rol...</option>
            {roles?.map((r) => (
              <option key={r._id} value={r._id}>
                {r.nombre}
              </option>
            ))}
          </select>
          <select
            value={nivelId}
            onChange={(e) => setNivelId(e.target.value as Id<"instruccion">)}
            style={panel.input}
          >
            <option value="">Nivel de instrucción (opcional)...</option>
            {instrucciones?.map((i) => (
              <option key={i._id} value={i._id}>
                {i.nombre}
              </option>
            ))}
          </select>
          <button type="submit" disabled={guardando} style={panel.submitBtn}>
            {guardando ? "Creando..." : "Crear usuario"}
          </button>
        </form>
      )}

      {error && <div style={panel.errorBox}>⚠️ {error}</div>}

      {usuarios === undefined ? (
        <p style={panel.muted}>Cargando usuarios...</p>
      ) : usuarios.length === 0 ? (
        <p style={panel.muted}>Todavía no hay usuarios registrados.</p>
      ) : (
        <div style={panel.list}>
          {usuarios.map((usuario) => (
            <div key={usuario._id} style={panel.rowStatic}>
              <div>
                <span style={panel.rowTitle}>{usuario.nombre}</span>
                <br />
                <span style={panel.rowMeta}>
                  {usuario.email} · {usuario.carrera || "sin carrera"}
                </span>
              </div>
              <span style={panel.rolePill}>{nombreDeRol(usuario.rol_id)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
