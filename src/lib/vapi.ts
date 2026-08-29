import VapiImport from "@vapi-ai/web";

// Vite's CJS interop for this package sometimes fails to unwrap the default
// export, leaving `VapiImport` as `{ default: Vapi }` instead of the class
// itself. Fall back to the nested default when that happens.
const Vapi = (VapiImport as unknown as { default?: typeof VapiImport }).default ?? VapiImport;

/**
 * Vapi client for KOEDUKO
 *
 * Handles voice sessions: capture audio → transcribe → analyze with Claude → send to Convex
 */
export const vapi = new Vapi(import.meta.env.VITE_VAPI_API_KEY);

/**
 * Start a voice learning session
 */
export const startSession = async (sessionId: string, userId: string) => {
  try {
    await vapi.start(import.meta.env.VITE_VAPI_ASSISTANT_ID, {
      firstMessage: `Hola ${userId}, la sesión de aprendizaje ha iniciado. ¿Quién habla primero?`,
      metadata: { sessionId, userId },
    });
    console.log(`Sesión ${sessionId} iniciada con usuario ${userId}`);
    return true;
  } catch (error) {
    console.error("Error iniciando Vapi:", error);
    return false;
  }
};

/**
 * Stop the current voice session
 */
export const stopSession = () => {
  try {
    vapi.stop();
    console.log("Sesión de Vapi terminada");
  } catch (error) {
    console.error("Error deteniendo Vapi:", error);
  }
};

// ─── Event listeners ───

vapi.on("message", (message) => {
  console.log("[Vapi] Mensaje:", message);
});

vapi.on("speech-start", () => {
  console.log("[Vapi] Usuario empezó a hablar");
});

vapi.on("speech-end", () => {
  console.log("[Vapi] Usuario dejó de hablar");
});

vapi.on("call-start", () => {
  console.log("[Vapi] Llamada conectada");
});

vapi.on("call-end", () => {
  console.log("[Vapi] Llamada terminada");
});

vapi.on("error", (error) => {
  console.error("[Vapi] Error:", error);
});
