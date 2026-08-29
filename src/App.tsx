import { useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SessionLiveView } from "./components/SessionLiveView";
import { startSession, stopSession } from "./lib/vapi";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

export default function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionIds, setSessionIds] = useState({ session: "", vapi: "" });

  const handleStartSession = async () => {
    // TODO: Crear sesión en Convex primero
    // const session = await createSession()
    // await initializeVapiSession(session._id, vapiCallId)
    // Luego:
    await startSession("session-123", "Pepito");
    setSessionActive(true);
    setSessionIds({ session: "session-123", vapi: "vapi-session-123" });
  };

  const handleEndSession = async () => {
    stopSession();
    setSessionActive(false);
  };

  return (
    <ConvexProvider client={convex}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">KOEDUKO - Sesión en Vivo</h1>

          <div className="mb-6">
            {!sessionActive ? (
              <button
                onClick={handleStartSession}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Iniciar Sesión Vapi
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Finalizar Sesión
              </button>
            )}
          </div>

          {sessionActive && (
            <SessionLiveView
              vapiSessionId={sessionIds.vapi}
              sessionId={sessionIds.session}
            />
          )}
        </div>
      </div>
    </ConvexProvider>
  );
}
