import { httpRouter } from "convex/server";
import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";

export const vapiWebhook = httpRouter();

/**
 * Forma real de los mensajes que manda Vapi.
 *
 * Vapi no envía `{ event, data }`: envía `{ message: { type, ... } }`, donde
 * `type` distingue el evento. El `callId` vive en `message.call.id` y es el
 * UUID que asigna Vapi, no el que genere el frontend.
 */
type VapiServerMessage = {
  type?: string;
  role?: string;
  transcript?: string;
  transcriptType?: string;
  secondsFromStart?: number;
  status?: string;
  call?: { id?: string };
};

const parseRole = (role: string | undefined) =>
  role === "assistant" || role === "user" ? role : null;

vapiWebhook.route({
  path: "/vapi-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // El endpoint es público. Cuando hay secreto configurado en el deployment
    // se exige que Vapi lo mande, para que nadie más pueda inyectar
    // transcripciones en una sesión ajena.
    const secret = process.env.VAPI_SERVER_SECRET;
    if (secret && request.headers.get("x-vapi-secret") !== secret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    try {
      const body = await request.json();
      const message: VapiServerMessage = body?.message ?? {};
      const callId = message.call?.id;

      if (!callId) {
        // Vapi manda algunos eventos sin llamada asociada. Se responde 200
        // igual: un error haría que reintentara el envío indefinidamente.
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }

      switch (message.type) {
        case "transcript": {
          // Solo las finales. Vapi emite parciales por cada palabra a medio
          // formar; guardarlas llenaría la tabla de fragmentos duplicados.
          if (message.transcriptType !== "final") break;

          const role = parseRole(message.role);
          const text = message.transcript ?? "";
          if (!role || text.trim().length === 0) break;

          // Se guardan las dos partes de la conversación, no solo al
          // estudiante: sin la pregunta del asistente el reporte no puede
          // interpretar la respuesta.
          // El análisis lo agenda la propia mutation, y solo cuando la frase
          // es nueva. Si ya había entrado por el navegador, acá no se hace
          // nada: así no se paga dos veces el mismo análisis.
          await ctx.runMutation(api.functions.transcriptions.ingestTranscript, {
            vapiCallId: callId,
            role,
            text,
            secondsFromStart: message.secondsFromStart,
            source: "webhook",
          });
          break;
        }

        case "end-of-call-report": {
          // Se agenda, no se genera al toque: las últimas frases pueden tener
          // el análisis todavía en curso. La generación corta sola si el
          // reporte ya existe.
          await ctx.runMutation(api.functions.reports.scheduleSessionReport, {
            vapiCallId: callId,
          });
          break;
        }

        case "status-update": {
          if (message.status === "ended") {
            await ctx.runMutation(api.functions.sessions.markCallEnded, {
              vapiCallId: callId,
            });
          }
          break;
        }
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      console.error("Error procesando el webhook de Vapi:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
      });
    }
  }),
});
