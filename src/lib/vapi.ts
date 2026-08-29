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

/** A finalized line of the conversation, either side of it. */
export interface TranscriptLine {
  role: "user" | "assistant";
  text: string;
  secondsFromStart?: number;
}

/**
 * Convex HTTP actions are served from `.convex.site`, not the `.convex.cloud`
 * origin the client SDK talks to. Vapi posts its webhook to this URL, so it has
 * to be the site one or every server-side event 404s.
 */
const convexSiteUrl = (): string | null => {
  const explicit = import.meta.env.VITE_CONVEX_SITE_URL;
  if (explicit) return explicit;

  const cloud = import.meta.env.VITE_CONVEX_URL;
  if (!cloud) return null;

  return cloud.replace(/\.convex\.cloud\/?$/, ".convex.site");
};

/**
 * Subscribers notified on every finalized transcript line.
 *
 * Transcription runs down two independent paths: this one, in the browser, and
 * the webhook on the server. The browser path shows text the moment it is
 * spoken; the webhook path keeps recording even if the tab is closed mid-call.
 * Convex deduplicates whatever arrives twice.
 */
const transcriptListeners = new Set<(line: TranscriptLine) => void>();

export const onTranscript = (listener: (line: TranscriptLine) => void) => {
  transcriptListeners.add(listener);
  return () => {
    transcriptListeners.delete(listener);
  };
};

interface VapiTranscriptMessage {
  type?: string;
  role?: string;
  transcript?: string;
  transcriptType?: string;
  secondsFromStart?: number;
}

/**
 * Start a voice learning session.
 *
 * Returns the call id Vapi assigns on connect. That id — not one made up by the
 * caller — is what identifies the session in every webhook Vapi sends, so it
 * has to be written back to the Convex session before any server event lands.
 */
export const startSession = async (
  sessionId: string,
  userId: string
): Promise<string | null> => {
  try {
    const siteUrl = convexSiteUrl();

    const overrides: Record<string, unknown> = {
      firstMessage: `Hola ${userId}, la sesión de aprendizaje ha iniciado. ¿Quién habla primero?`,
      metadata: { sessionId, userId },
    };

    // Declaring the webhook here instead of in the Vapi dashboard keeps the
    // server path working from any deployment without manual configuration.
    if (siteUrl) {
      overrides.server = { url: `${siteUrl}/vapi-webhook` };
      overrides.serverMessages = [
        "transcript",
        "status-update",
        "end-of-call-report",
      ];
    } else {
      console.warn(
        "Falta VITE_CONVEX_URL: la sesión corre sin webhook y solo transcribe mientras la pestaña siga abierta."
      );
    }

    // The SDK's override type does not model `server`/`serverMessages`, but the
    // API accepts them as assistant overrides.
    const call = await vapi.start(
      import.meta.env.VITE_VAPI_ASSISTANT_ID,
      overrides as never
    );

    const callId = (call as { id?: string } | null)?.id ?? null;
    console.log(`Sesión ${sessionId} iniciada con usuario ${userId}`, callId);
    return callId;
  } catch (error) {
    console.error("Error iniciando Vapi:", error);
    return null;
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

vapi.on("message", (message: VapiTranscriptMessage) => {
  if (message?.type !== "transcript") return;

  // Only finalized lines. Vapi streams a partial per half-formed word; storing
  // those would fill the table with fragments of the same sentence.
  if (message.transcriptType !== "final") return;

  const role = message.role === "assistant" ? "assistant" : "user";
  const text = (message.transcript ?? "").trim();
  if (text.length === 0) return;

  for (const listener of transcriptListeners) {
    try {
      listener({ role, text, secondsFromStart: message.secondsFromStart });
    } catch (error) {
      console.error("[Vapi] Error en listener de transcripción:", error);
    }
  }
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
