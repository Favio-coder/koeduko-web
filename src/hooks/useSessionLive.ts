import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export const useSessionLive = (vapiSessionId: string) => {
  const analyses = useQuery(
    // @ts-ignore
    api["functions/realtime"].subscribeToSession,
    vapiSessionId ? { vapiSessionId: vapiSessionId as any } : "skip"
  );

  const [liveData, setLiveData] = useState<any[]>([]);

  useEffect(() => {
    if (analyses) {
      setLiveData(analyses);
    }
  }, [analyses]);

  return { liveData, analyses };
};

export const useSessionReports = (sessionId: string) => {
  const reports = useQuery(
    // @ts-ignore
    api["functions/realtime"].subscribeToSessionReports,
    sessionId ? { sessionId: sessionId as any } : "skip"
  );

  return reports || [];
};
