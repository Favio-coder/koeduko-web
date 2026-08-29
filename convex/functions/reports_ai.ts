"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Reportes personalizados escritos por Claude a partir de la conversación.
 *
 * Vive en un archivo aparte con "use node" porque el SDK de Anthropic necesita
 * ese runtime, y Convex solo admite actions ahí.
 *
 * Reemplaza el resumen por plantilla, que decía siempre lo mismo: un promedio y
 * una de dos frases fijas según si superaba 5. Acá el modelo lee lo que el
 * alumno realmente dijo.
 */

const REPORTE_SCHEMA = {
  type: "object",
  properties: {
    resumen: {
      type: "string",
      description:
        "Dos o tres frases dirigidas al docente sobre cómo le fue a este estudiante, citando lo que dijo",
    },
    conceptosDominados: {
      type: "array",
      items: { type: "string" },
      description: "Conceptos que el estudiante demostró entender",
    },
    conceptosAReforzar: {
      type: "array",
      items: { type: "string" },
      description: "Conceptos que mencionó sin llegar a comprender",
    },
    recomendaciones: {
      type: "array",
      items: { type: "string" },
      description:
        "Una a tres acciones concretas para este estudiante, no consejos genéricos",
    },
  },
  required: [
    "resumen",
    "conceptosDominados",
    "conceptosAReforzar",
    "recomendaciones",
  ],
  additionalProperties: false,
} as const;

/**
 * Genera un reporte por cada estudiante que participó en la sesión.
 *
 * Se le pasa la conversación completa, incluidas las intervenciones del
 * asistente: sin la pregunta, una respuesta suelta no se puede interpretar.
 */
export const generateAIReports = action({
  args: {
    vapiCallId: v.string(),
  },
  handler: async (ctx, args) => {
    const datos = await ctx.runQuery(
      internal.functions.reports_data.conversacionPorEstudiante,
      { vapiCallId: args.vapiCallId }
    );

    if (!datos || datos.estudiantes.length === 0) {
      return { generados: 0, motivo: "La sesión no tiene intervenciones de estudiantes" };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Falta la variable ANTHROPIC_API_KEY en el deployment de Convex"
      );
    }

    const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
    const anthropic = new Anthropic({
      apiKey,
      ...(workspaceId
        ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } }
        : {}),
    });

    let generados = 0;

    for (const estudiante of datos.estudiantes) {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system:
          "Sos un asistente pedagógico que ayuda a docentes a entender cómo le fue " +
          "a cada estudiante en una sesión de aprendizaje. Escribís en español rioplatense, " +
          "para que lo lea el docente. Basate solo en lo que el estudiante dijo: no " +
          "supongas conocimientos que no aparecen en la conversación, y si participó poco, " +
          "decilo en vez de inventar una evaluación.",
        output_config: {
          format: { type: "json_schema", schema: REPORTE_SCHEMA },
        },
        messages: [
          {
            role: "user",
            content:
              `Conversación completa de la sesión:\n\n${datos.conversacion}\n\n` +
              `Analizá específicamente las intervenciones de ${estudiante.nombre}:\n\n` +
              `${estudiante.intervenciones.join("\n")}`,
          },
        ],
      });

      if (message.stop_reason === "refusal") continue;

      const bloque = message.content.find((b) => b.type === "text");
      if (!bloque || bloque.type !== "text") continue;

      const reporte = JSON.parse(bloque.text) as {
        resumen: string;
        conceptosDominados: string[];
        conceptosAReforzar: string[];
        recomendaciones: string[];
      };

      await ctx.runMutation(internal.functions.reports_data.guardarReporteIA, {
        sessionId: datos.sessionId,
        userId: estudiante.id,
        totalParticipation: estudiante.participacion,
        avgQuality: estudiante.avgQuality,
        conceptsMastered: reporte.conceptosDominados,
        conceptsMissed: reporte.conceptosAReforzar,
        summaryText: reporte.resumen,
        recommendations: reporte.recomendaciones,
      });

      generados += 1;
    }

    return { generados };
  },
});
