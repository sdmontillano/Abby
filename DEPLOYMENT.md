# Monica AI - Vercel Deployment Guide

## ✅ What's Been Fixed & Enhanced

### 1. Fixed "Unexpected token '<'" JSON Parse Error
- **Root cause**: API route was returning HTML instead of JSON
- **Fix**: Updated API route with proper error handling and JSON validation
- **Cleanup**: Removed duplicate API file (`src/api/abby-chat.js`)

### 2. Fixed Vercel "invalid runtime: nodejs18.x" Error
- **Root cause**: Old Astro v2 and @astrojs/vercel v3 generated nodejs18.x runtime
- **Fix**: 
  - Upgraded to Astro v6 and @astrojs/vercel v10
  - Added postbuild script to patch runtime to nodejs20.x
  - Removed .vercel/ from git tracking

### 3. Monica AI Can Now Answer ALL Questions
- **Upgraded model**: `gpt-3.5-turbo` → `gpt-4o-mini` (better answers, faster, cheaper)
- **Added conversation history**: Monica now remembers context from the entire conversation
- **Enhanced system prompt**: Explicitly tells Monica she can answer ANY question
- **Increased max tokens**: 400 → 1000 for more detailed responses

### 4. Added Personality to Monica AI
- **New traits**: Curious, helpful, occasionally uses humor, asks follow-up questions, celebrates user wins
- **Personality quirks**: Uses em-dashes, asks clarifying questions, celebrates good news
- **Customizable**: Use the PersonaEditor component to adjust Monica's personality
- **Capabilities**: General knowledge, coding, creative writing, analysis, problem-solving

### 5. Better Error Handling
- Non-JSON responses are now detected and show user-friendly errors
- API errors are logged to console for debugging
- Clear error messages if OpenAI API key is missing

---

## 🚀 Deploy to Vercel (Step-by-Step)

### Step 1: Get FREE Groq API Key
1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up for free account
3. Create a new API key
4. Copy the key (starts with `gsk_`)

**Free tier includes**: 14,400 requests/day, Llama 3, Mixtral models

### Step 2: Set Environment Variables in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **fun** project
3. Go to **Settings** → **Environment Variables**
4. Add the following:

| Name | Value | Environment |
|------|-------|-------------|
| `GROQ_API_KEY` | `gsk_your-groq-api-key-here` | Production, Preview, Development |

**Paste your Groq API key** (starts with `gsk_`)

### Step 2: Set Node.js Version in Vercel
1. In your Vercel project dashboard, go to **Settings** → **General**
2. Scroll to **Build & Development Settings**
3. Set **Node.js Version** to **20.x** (or 22.x if available)
4. Click **Save**

### Step 3: Trigger New Deployment
**Option A: Via Git Push**
```bash
git add -A
git commit -m "fix: Force nodejs20.x runtime for Vercel"
git push origin main
```

**Option B: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Check "Use existing Build Cache" → **No** (important!)

---

## 🧪 Test Locally

1. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-your-actual-key
```

3. Run development server:
```bash
pnpm install
pnpm dev
```

4. Open http://localhost:4321 and test Monica AI!

---

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | (required) | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use (can use `gpt-4o` for even better answers) |
| `OPENAI_MAX_TOKENS` | `1000` | Maximum response length |
| `OPENAI_TEMPERATURE` | `0.7` | Creativity level (0.0-1.0) |

---

## 🔧 Troubleshooting

### "Invalid runtime: nodejs18.x" Error
**Solution**: 
1. Ensure you've pushed the latest code (with postbuild script)
2. In Vercel dashboard, go to Settings → General → Node.js Version → Set to 20.x
3. Redeploy with "Clear Build Cache" option

### "Unexpected token '<'" Error
**Solution**: 
1. Check that `OPENAI_API_KEY` is set in Vercel environment variables
2. Check Vercel deployment logs for API errors
3. Test API locally with `pnpm dev`

### Build Fails with pnpm
**Solution**:
1. Vercel supports pnpm - no changes needed
2. Ensure `pnpm-lock.yaml` is committed to git
3. If issues persist, try deleting `node_modules` and `pnpm-lock.yaml`, then `pnpm install`

---

## 🎉 Monica AI is Ready!

- ✅ Can answer ANY question
- ✅ Has personality and remembers conversations
- ✅ Handles errors gracefully
- ✅ Ready for Vercel deployment
- ✅ Customizable persona via PersonaEditor
- ✅ Fixed Vercel runtime issues

**Next step**: Add your `OPENAI_API_KEY` to Vercel and redeploy with cleared cache!
