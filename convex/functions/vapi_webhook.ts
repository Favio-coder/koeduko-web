import { httpRouter } from "convex/server";
import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";

export const vapiWebhook = httpRouter();

vapiWebhook.route({
  path: "/vapi-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { event, data } = body;

      if (event === "call.started") {
        console.log("Llamada iniciada:", data.callId);
        // El frontend ya creó vapi_sessions, aquí solo logging
      }

      if (event === "message") {
        // Vapi envía transcripción + análisis
        const { callId, role, message } = data;
        
        if (role === "assistant") return new Response(null, { status: 200 }); // Solo guardar respuestas de usuario

        // Guardar transcripción
        // @ts-ignore
        await ctx.runMutation(api["functions/transcriptions"].createTranscription, {
          vapiCallId: callId,
          rawText: message,
        });

        // Procesar con Claude (análisis IA)
        // @ts-ignore
        await ctx.runMutation(api["functions/analysis"].analyzeTranscription, {
          callId,
          text: message,
        });
      }

      if (event === "call.ended") {
        console.log("Llamada finalizada:", data.callId);
        
        // Generar reporte final
        // @ts-ignore
        await ctx.runMutation(api["functions/reports"].generateSessionReport, {
          vapiCallId: data.callId,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
  }),
});
