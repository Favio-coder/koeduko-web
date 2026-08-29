import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"

export default function Dashboard() {
  const roles = useQuery(api.roles.listar)

  if (roles === undefined) {
    return <p>Cargando datos de Convex...</p>
  }

  return (
    <section id="center">
      <div className="hero">
        <h1>Panel Principal - KoEduko</h1>
        <p>Conectado con la base de datos Convex en tiempo real</p>
      </div>
      <div>
        <h2>Roles en la base de datos</h2>
        <ul>
          {roles.map((rol) => (
            <li key={rol._id}>
              <strong>{rol.nombre}</strong>: {rol.desc}
            </li>
          ))}
        </ul>
        {roles.length === 0 && <p>No hay roles definidos aún en la base de datos.</p>}
      </div>
    </section>
  )
}