import { buildSystemPrompt } from '../lib/prompts.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST({ request }) {
  try {
    const { message, persona } = await request.json();

    // Load API key from env (server-side)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || (typeof import.meta !== 'undefined' ? import.meta.env.OPENAI_API_KEY : undefined);
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = buildSystemPrompt(persona);

    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 400,
      temperature: 0.7
    };

    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI API error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? '';

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
