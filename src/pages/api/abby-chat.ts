import { buildSystemPrompt } from '../../lib/prompts.js';

export const prerender = false;

// Groq API configuration (free tier: 14,400 requests/day per key)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Support multiple API keys (comma-separated in env)
const GROQ_API_KEYS = (process.env.GROQ_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
let currentKeyIndex = 0;

// Track rate limit reset times per key (per-minute limit: ~30 req/min per key)
const keyRateLimitReset = new Map<number, number>();

// Helper to get current key
function getApiKey() {
  return GROQ_API_KEYS[currentKeyIndex] || '';
}

// Check if a key is still in cooldown period
function isKeyRateLimited(index: number): boolean {
  const resetTime = keyRateLimitReset.get(index);
  if (resetTime && Date.now() < resetTime) {
    return true; // Still in cooldown
  }
  return false;
}

function rotateApiKey() {
  if (GROQ_API_KEYS.length <= 1) return; // No rotation if only one key
  
  const originalIndex = currentKeyIndex;
  do {
    currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
    // Skip keys that are still rate-limited
    if (!isKeyRateLimited(currentKeyIndex)) {
      console.log(`Rotating to API key index ${currentKeyIndex}`);
      return;
    }
  } while (currentKeyIndex !== originalIndex);
  
  // All keys are rate-limited
  console.warn('All keys are currently rate-limited');
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const clientMessages = body.messages || [];
    const persona = body.persona;

    // Validate request
    if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Load API keys from env (server-side)
    if (GROQ_API_KEYS.length === 0) {
      return new Response(JSON.stringify({ error: 'Groq API key not configured. Get a free key at https://console.groq.com/keys' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = buildSystemPrompt(persona);
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'; // Free tier model
    const maxTokens = parseInt(process.env.GROQ_MAX_TOKENS || '1000') || 1000;
    const temperature = parseFloat(process.env.GROQ_TEMPERATURE || '0.7') || 0.7;

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

    // Try each API key in rotation on rate limit (429)
    let lastError = null;
    for (let attempt = 0; attempt < GROQ_API_KEYS.length; attempt++) {
      const currentKey = getApiKey();
      
      // Skip keys that are still in rate limit cooldown
      if (isKeyRateLimited(currentKeyIndex)) {
        console.warn(`Key ${currentKeyIndex + 1} is rate-limited until ${new Date(keyRateLimitReset.get(currentKeyIndex)!).toISOString()}. Skipping...`);
        rotateApiKey();
        continue;
      }
      
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentKey}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content?.trim() ?? '';
        
        if (!reply) {
          throw new Error('No response from AI. Please try again.');
        }

        return new Response(JSON.stringify({ reply }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const errText = await res.text();
      console.error(`Groq API error (key ${currentKeyIndex}):`, res.status, errText);
      
      // Handle specific error cases
      if (res.status === 429) {
        // Rate limited - mark this key as rate-limited for 60 seconds (per-minute limit)
        keyRateLimitReset.set(currentKeyIndex, Date.now() + 60000);
        lastError = `Rate limit reached on API key ${currentKeyIndex + 1}/${GROQ_API_KEYS.length}. Cooling down for 60s. Trying next key...`;
        console.warn(lastError);
        rotateApiKey();
        continue;
      }
      
      if (res.status === 401) {
        // Invalid key, try next key
        lastError = `Invalid API key ${currentKeyIndex + 1}/${GROQ_API_KEYS.length}. Trying next key...`;
        console.warn(lastError);
        rotateApiKey();
        continue;
      }
      
      // Other errors, don't retry
      throw new Error(`AI service error (${res.status}). Details: ${errText}`);
    }

    // All keys exhausted - check if all are rate-limited
    const allRateLimited = GROQ_API_KEYS.every((_, index) => isKeyRateLimited(index));
    if (allRateLimited) {
      const resetTime = Math.min(...Array.from(keyRateLimitReset.values()));
      throw new Error(`All ${GROQ_API_KEYS.length} API keys are rate-limited. Please wait about ${Math.ceil((resetTime - Date.now()) / 1000)} seconds before trying again. (Per-minute limit: ~30 req/min per key)`);
    }
    
    throw new Error(`All ${GROQ_API_KEYS.length} API keys exhausted. Free tier: 14,400 requests/day per key. Please add more keys or wait.`);
    
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
