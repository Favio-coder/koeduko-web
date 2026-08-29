import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const analyzeTranscription = mutation({
  args: {
    callId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // Llamar a Claude API para analizar
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // @ts-ignore
        "x-api-key": process.env.CLAUDE_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `Analiza esta respuesta de estudiante. Retorna JSON con: {"quality": 1-10, "understanding": true/false, "concepts": ["concept1", "concept2"], "sentiment": "positive/neutral/negative"}\n\nRespuesta: "${args.text}"`,
          },
        ],
      }),
    });

    const claudeData = await claudeResponse.json();
    const analysisText =
      claudeData.content && claudeData.content[0].type === "text" ? claudeData.content[0].text : "{}";

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      analysis = {
        quality: 5,
        understanding: false,
        concepts: [],
        sentiment: "neutral",
      };
    }

    // Encontrar transcription y guardar análisis
    // Buscamos la sesión de Vapi primero
    const vapiSession = await ctx.db
      .query("vapi_sessions")
      .filter((q) => q.eq(q.field("vapiCallId"), args.callId))
      .first();

    const transcription = await ctx.db
      .query("transcriptions")
      .filter((q) => q.eq(q.field("vapiSessionId"), vapiSession?._id || "placeholder-id"))
      .order("desc")
      .first();

    if (transcription) {
      await ctx.db.insert("ai_analysis", {
        transcriptionId: transcription._id,
        userId: transcription.userId,
        quality: analysis.quality || 5,
        understanding: analysis.understanding || false,
        concepts: analysis.concepts || [],
        sentiment: analysis.sentiment || "neutral",
        response_text: args.text,
        createdAt: Date.now(),
      });
    }

    return analysis;
  },
});
