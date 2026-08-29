import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Los IDs se tipan como Id<...> | null a propósito: si son null la query se
 * omite con "skip". Pasar un string arbitrario haría que el validator v.id()
 * del servidor rechace el argumento y useQuery lance durante el render.
 */
export const useSessionLive = (vapiSessionId: Id<"vapi_sessions"> | null) => {
  const analyses = useQuery(
    api.functions.realtime.subscribeToSession,
    vapiSessionId ? { vapiSessionId } : "skip"
  );

  return { liveData: analyses ?? [], analyses };
};

export const useSessionReports = (sessionId: Id<"study_sessions"> | null) => {
  const reports = useQuery(
    api.functions.realtime.subscribeToSessionReports,
    sessionId ? { sessionId } : "skip"
  );

  return reports ?? [];
};

/**
 * Transcripción completa de la sesión, ambos lados de la conversación.
 *
 * Se separa del análisis a propósito: el texto aparece apenas se dice, mientras
 * que el análisis tarda lo que tarde la llamada a Claude. Si la vista dependiera
 * solo del análisis, la sesión parecería no estar escuchando nada.
 */
export const useSessionTranscript = (
  vapiSessionId: Id<"vapi_sessions"> | null
) => {
  const transcript = useQuery(
    api.functions.transcriptions.getSessionTranscriptions,
    vapiSessionId ? { vapiSessionId } : "skip"
  );

  return transcript ?? [];
};
