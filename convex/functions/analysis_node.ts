"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Esta action vive en su propio archivo porque el SDK de Anthropic usa APIs de
 * Node (node:fs, node:path), lo que obliga a la directiva "use node". Convex
 * solo admite actions en esos archivos, así que las queries y mutations que
 * acompañan al análisis quedan en analysis.ts.
 */

/**
 * Esquema del análisis que devuelve Claude.
 *
 * Se pasa como structured output: la API garantiza que la respuesta cumple el
 * esquema, así que no hace falta un fallback por si el modelo devuelve algo
 * que no es JSON válido.
 */
const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    quality: {
      type: "integer",
      description: "Calidad de la respuesta del estudiante, de 1 a 10",
    },
    understanding: {
      type: "boolean",
      description: "Si el estudiante demuestra haber entendido el concepto",
    },
    concepts: {
      type: "array",
      items: { type: "string" },
      description: "Conceptos que aparecen en la respuesta",
    },
    sentiment: {
      type: "string",
      enum: ["positive", "neutral", "negative"],
      description: "Tono general de la respuesta",
    },
  },
  required: ["quality", "understanding", "concepts", "sentiment"],
  additionalProperties: false,
} as const;

/**
 * Analiza una respuesta de estudiante con Claude y guarda el resultado.
 *
 * Es una `action`, no una `mutation`: las mutations de Convex son
 * transaccionales y no pueden hacer llamadas de red. Las escrituras a la base
 * se delegan en `saveAnalysis`.
 */
export const analyzeTranscription = action({
  args: {
    // La transcripción llega identificada, no se busca "la última de la
    // llamada": con dos frases entrando casi a la vez, la última no es
    // necesariamente la que disparó este análisis.
    transcriptionId: v.id("transcriptions"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const transcription = await ctx.runQuery(
      internal.functions.analysis.transcriptionById,
      { transcriptionId: args.transcriptionId }
    );

    // Sin transcripción no hay a qué asociar el análisis, y la llamada a Claude
    // se cobraría sin poder guardar el resultado.
    if (!transcription) {
      throw new Error(`No existe la transcripción ${args.transcriptionId}`);
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Falta la variable ANTHROPIC_API_KEY en el deployment de Convex"
      );
    }

    // Las keys ligadas a una identidad exigen declarar en qué workspace actúa
    // la petición; las keys de workspace no lo necesitan. El id no es secreto,
    // pero se lee del entorno para no atarlo al código.
    const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;

    const anthropic = new Anthropic({
      apiKey,
      ...(workspaceId
        ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } }
        : {}),
    });

    const message = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      system:
        "Analizás respuestas de estudiantes en sesiones de aprendizaje. " +
        "Evaluá solamente lo que dice la respuesta, sin suponer contexto que no esté presente.",
      output_config: {
        format: { type: "json_schema", schema: ANALYSIS_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: `Analizá esta respuesta de estudiante:\n\n"${args.text}"`,
        },
      ],
    });

    // Con structured outputs la respuesta cumple el esquema, pero el modelo
    // puede rechazar la petición o quedarse sin tokens antes de completarla.
    if (message.stop_reason === "refusal") {
      throw new Error("Claude rechazó analizar la transcripción");
    }
    if (message.stop_reason === "max_tokens") {
      throw new Error("El análisis se cortó por límite de tokens");
    }

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Claude no devolvió contenido de texto");
    }

    const analysis = JSON.parse(textBlock.text) as {
      quality: number;
      understanding: boolean;
      concepts: string[];
      sentiment: string;
    };

    await ctx.runMutation(internal.functions.analysis.saveAnalysis, {
      transcriptionId: transcription._id,
      userId: transcription.userId,
      quality: analysis.quality,
      understanding: analysis.understanding,
      concepts: analysis.concepts,
      sentiment: analysis.sentiment,
      responseText: args.text,
    });

    return analysis;
  },
});
