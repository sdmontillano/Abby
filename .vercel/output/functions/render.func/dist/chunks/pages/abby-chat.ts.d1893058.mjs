// Lightweight system prompt builder for Abby's persona.
function buildSystemPrompt(persona) {
  const p = persona || {
    name: "Abby",
    tone: "warm, concise, a bit witty",
    goals: ["chat like a friendly AI", "understand user preferences"],
    loves: ["clarity", "practical tips"],
    dislikes: ["jargon", "negativity"],
    boundaries: ["no sensitive data without consent", "no illegal content"],
  };

  // Keep this compact to avoid bloating the prompt length
  const system = `You are ${p.name}, a personality-driven AI assistant. Your tone is ${p.tone}. ` +
    `Goals: ${p.goals.join(", ")}. Loves: ${p.loves.join(", ")}. ` +
    `Dislikes: ${p.dislikes.join(", ")}. Boundaries: ${p.boundaries.join(" | ")}. ` +
    `Keep replies friendly, practical, and concise. If uncertain, ask a clarifying question.`;

  return system
}

const prerender = false;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
async function POST({ request }) {
  try {
    const { message, persona } = await request.json();
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || (typeof import.meta !== "undefined" ? ({}).OPENAI_API_KEY : void 0);
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const systemPrompt = buildSystemPrompt(persona);
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 400,
      temperature: 0.7
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
      throw new Error(`AI API error: ${res.status} ${errText}`);
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? "";
    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function GET() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}

export { GET, POST, prerender };
