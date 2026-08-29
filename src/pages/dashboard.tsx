import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { startSession, stopSession } from "../lib/vapi"
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

      <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2>Prueba de Vapi (Voz AI)</h2>
        <p>Hacé clic para probar la conexión con Claude a través de Vapi.</p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button 
            onClick={() => startSession("test-session-1", "Pepito")}
            style={{ padding: "0.5rem 1rem", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            🎙️ Iniciar Llamada
          </button>
          <button 
            onClick={() => stopSession()}
            style={{ padding: "0.5rem 1rem", background: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            ⏹️ Detener
          </button>
        </div>
      </div>
    </section>
  )
}