import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/vapi-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const eventType = body.message?.type || body.type;

      switch (eventType) {
        // ─── Llamada iniciada ───
        case "call.started":
        case "status-update": {
          if (body.message?.status === "in-progress" || eventType === "call.started") {
            const callId = body.message?.call?.id || body.call?.id;
            // Para poder crear la sesión, necesitamos el sessionId (study_sessions) real.
            // Asumimos que viene en el metadata. Si no, en un entorno real habría que manejarlo diferente.
            const sessionIdStr = body.message?.call?.metadata?.sessionId || body.call?.metadata?.sessionId;
            
            if (callId && sessionIdStr) {
              await ctx.runMutation(api.vapi.createSession, {
                vapiCallId: callId,
                sessionId: sessionIdStr as Id<"study_sessions">,
              });
            }
          }
          break;
        }

        // ─── Llamada terminada ───
        case "call.ended":
        case "end-of-call-report": {
          const callId = body.message?.call?.id || body.call?.id;
          if (callId) {
            await ctx.runMutation(api.vapi.updateSessionStatus, {
              vapiCallId: callId,
              status: "completed",
            });
          }
          break;
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Vapi webhook error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
