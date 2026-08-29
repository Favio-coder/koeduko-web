import React from "react";
import {
  useSessionLive,
  useSessionReports,
  useSessionTranscript,
} from "../hooks/useSessionLive";
import type { Id } from "../../convex/_generated/dataModel";

interface SessionLiveViewProps {
  vapiSessionId: Id<"vapi_sessions"> | null;
  sessionId: Id<"study_sessions"> | null;
}

export const SessionLiveView: React.FC<SessionLiveViewProps> = ({
  vapiSessionId,
  sessionId,
}) => {
  const { liveData } = useSessionLive(vapiSessionId);
  const transcript = useSessionTranscript(vapiSessionId);
  const reports = useSessionReports(sessionId);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Sesión en Vivo</h2>

      {/* TRANSCRIPCIÓN */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Transcripción</h3>
        {transcript.length > 0 ? (
          <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
            {transcript.map((line) => (
              <div
                key={line._id}
                className={
                  line.role === "assistant"
                    ? "p-3 rounded bg-gray-100 border-l-4 border-gray-400"
                    : "p-3 rounded bg-blue-50 border-l-4 border-blue-500"
                }
              >
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  {line.role === "assistant" ? "Asistente" : "Estudiante"}
                </p>
                <p className="text-sm text-gray-800 mt-1">{line.rawText}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Escuchando...</p>
        )}
      </div>

      {/* DATOS EN TIEMPO REAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {liveData?.map((analysis, idx) => (
          <div
            key={idx}
            className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">Respuesta #{idx + 1}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {analysis.response_text}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {analysis.quality}/10
                </p>
                <p className="text-xs text-gray-500">
                  {analysis.understanding ? "✓ Entendido" : "✗ Confuso"}
                </p>
              </div>
            </div>
            {analysis.concepts?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-700">
                  Conceptos:
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {analysis.concepts.map((c: string, i: number) => (
                    <span
                      key={i}
                      className="inline-block bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* REPORTES FINALES */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-bold mb-4">Reportes por Alumno</h3>
        {reports?.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report: any, idx: number) => (
              <div key={idx} className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Alumno</p>
                    <p className="text-sm text-gray-600">{report.summaryText}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      {report.avgQuality}
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.totalParticipation.toFixed(0)}% participación
                    </p>
                  </div>
                </div>

                {report.recommendations?.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-100 rounded text-sm">
                    <p className="font-semibold text-yellow-800">
                      Recomendación:
                    </p>
                    <p className="text-yellow-700">
                      {report.recommendations[0]}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Reportes se generarán al finalizar la sesión</p>
        )}
      </div>
    </div>
  );
};
