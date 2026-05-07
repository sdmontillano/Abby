import { buildSystemPrompt } from '../../lib/prompts.js';

export const prerender = false;

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST({ request }) {
  try {
    const { messages: clientMessages, persona } = await request.json();

    // Validate request
    if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Load API key from env (server-side)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured. Set OPENAI_API_KEY in Vercel environment variables.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = buildSystemPrompt(persona);
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '1000');
    const temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');

    // Build full message history with system prompt first
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...clientMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('OpenAI API error:', res.status, errText);
      throw new Error(`AI service error (${res.status}). Please try again.`);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? '';

    if (!reply) {
      throw new Error('No response from AI. Please try again.');
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('API route error:', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true, message: 'Monica AI API is running' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
