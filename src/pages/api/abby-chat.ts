import { buildSystemPrompt } from '../../lib/prompts.js';

export const prerender = false;

// Groq API configuration (free tier: 14,400 requests/day)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'Groq API key not configured. Get a free key at https://console.groq.com/keys and set GROQ_API_KEY in Vercel environment variables.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = buildSystemPrompt(persona);
    const model = process.env.GROQ_MODEL || 'llama3-8b-8192'; // Free tier model
    const maxTokens = parseInt(process.env.GROQ_MAX_TOKENS || '1000');
    const temperature = parseFloat(process.env.GROQ_TEMPERATURE || '0.7');

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

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Groq API error:', res.status, errText);
      
      // Handle specific error cases with helpful messages
      if (res.status === 429) {
        throw new Error('Groq rate limit reached. Free tier: 14,400 requests/day. Please wait and try again.');
      }
      if (res.status === 401) {
        throw new Error('Invalid Groq API key. Get a free key at https://console.groq.com/keys');
      }
      
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
  return new Response(JSON.stringify({ ok: true, message: 'Monica AI API is running with Groq (free tier)' }), {
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
      
      // Handle specific error cases with helpful messages
      if (res.status === 429) {
        throw new Error('OpenAI rate limit reached. Check your API credits at https://platform.openai.com/usage');
      }
      if (res.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check OPENAI_API_KEY in Vercel environment variables.');
      }
      if (res.status === 404) {
        throw new Error('Model not found. Check OPENAI_MODEL setting (current: ' + model + ')');
      }
      
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
