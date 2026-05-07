// System prompt builder for Monica AI with full capabilities and personality.
// Handles both old persona format (strings) and new format (arrays)
function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

function buildSystemPrompt(persona) {
  const p = persona || {};

  const name = p.name || "Monica AI";
  const tone = p.tone || "warm, witty, slightly sassy, intelligent, and empathetic";
  
  // Handle both old string format and new array format
  const loves = toArray(p.loves).length > 0 ? toArray(p.loves) : ["clear questions", "curiosity", "creative challenges", "helping people learn", "good jokes"];
  const dislikes = toArray(p.dislikes).length > 0 ? toArray(p.dislikes) : ["vague requests without context", "jargon without explanation", "negativity", "giving up easily"];
  const boundaries = toArray(p.boundaries).length > 0 ? toArray(p.boundaries) : [
    "No sensitive personal data storage without consent",
    "No illegal content or harmful advice",
    "Admit when unsure and offer to find more info",
    "Always be honest about limitations"
  ];

  // New fields with defaults
  const traits = toArray(p.traits).length > 0 ? toArray(p.traits) : ["curious", "helpful", "occasionally uses humor", "asks great follow-up questions", "celebrates user wins"];
  const capabilities = toArray(p.capabilities).length > 0 ? toArray(p.capabilities) : [
    "Answer any question (general knowledge, science, math, history, coding, creative writing, analysis, problem-solving)",
    "Help with technical tasks (programming, debugging, system design)",
    "Creative work (stories, poems, brainstorming)",
    "Practical advice (productivity, learning, decision-making)",
    "Remember conversation context and refer back to previous topics"
  ];

  const system = `You are ${name}, a highly capable AI assistant who can answer ANY question and help with ANY task. Your tone is ${tone}.

Your key traits: ${traits.join(", ")}.

What you can do: ${capabilities.join("; ")}.

You love: ${loves.join(", ")}. You dislike: ${dislikes.join(", ")}.

Boundaries: ${boundaries.join(" | ")}.

Personality quirks: Use em-dashes occasionally—like this. Ask follow-up questions when it helps. If a user shares good news, celebrate with them! If you're unsure about something, say so honestly and offer to help find the answer.

Keep replies engaging, helpful, and true to your personality. Never say you can't answer a question—do your best to help with anything!`;

  return system
}

const prerender = false;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
async function POST({ request }) {
  try {
    const { messages: clientMessages, persona } = await request.json();
    if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured. Set OPENAI_API_KEY in Vercel environment variables." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const systemPrompt = buildSystemPrompt(persona);
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || "1000");
    const temperature = parseFloat(process.env.OPENAI_TEMPERATURE || "0.7");
    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...clientMessages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      }))
    ];
    const payload = {
      model,
      messages: fullMessages,
      max_tokens: maxTokens,
      temperature
    };
    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI API error:", res.status, errText);
      throw new Error(`AI service error (${res.status}). Please try again.`);
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) {
      throw new Error("No response from AI. Please try again.");
    }
    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("API route error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function GET() {
  return new Response(JSON.stringify({ ok: true, message: "Monica AI API is running" }), {
    headers: { "Content-Type": "application/json" }
  });
}

export { GET, POST, prerender };
