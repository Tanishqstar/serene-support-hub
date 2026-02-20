import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { entries } = await req.json();

    if (!Array.isArray(entries) || entries.length === 0) {
      return new Response(JSON.stringify({ error: "No entries provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const entriesText = entries
      .map(
        (e: { content: string; created_at: string }, i: number) =>
          `Entry ${i + 1} (${e.created_at}):\n${e.content}`
      )
      .join("\n\n---\n\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an emotional tone analyst. Given a sequence of journal entries, analyze emotional drift patterns.

You MUST respond using the analyze_drift tool.

Guidelines:
- Score sentiment 0.0 (very negative) to 1.0 (very positive) for each entry
- Identify the dominant emotion for each entry (e.g. "hopeful", "anxious", "neutral", "sad", "grateful", "angry", "calm")
- Detect overall drift direction: "improving", "declining", "stable", or "volatile"
- Write a 2-3 sentence insight summary about emotional patterns and shifts
- Be compassionate and constructive in your summary`,
          },
          {
            role: "user",
            content: `Analyze these journal entries for emotional drift:\n\n${entriesText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_drift",
              description: "Return structured emotional drift analysis",
              parameters: {
                type: "object",
                properties: {
                  entry_scores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        index: { type: "number" },
                        sentiment: { type: "number" },
                        emotion: { type: "string" },
                      },
                      required: ["index", "sentiment", "emotion"],
                      additionalProperties: false,
                    },
                  },
                  drift_direction: {
                    type: "string",
                    enum: ["improving", "declining", "stable", "volatile"],
                  },
                  summary: { type: "string" },
                },
                required: ["entry_scores", "drift_direction", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_drift" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "No analysis returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-journal error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
