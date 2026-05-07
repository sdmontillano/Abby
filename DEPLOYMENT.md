# Monica AI - Deployment Guide

## ✅ What's Been Fixed & Enhanced

### 1. Fixed "Unexpected token '<'" JSON Parse Error
- **Root cause**: API route was returning HTML instead of JSON
- **Fix**: Updated API route with proper error handling and JSON validation
- **Cleanup**: Removed duplicate API file (`src/api/abby-chat.js`)

### 2. Monica AI Can Now Answer ALL Questions
- **Upgraded model**: `gpt-3.5-turbo` → `gpt-4o-mini` (better answers, faster, cheaper)
- **Added conversation history**: Monica now remembers context from the entire conversation
- **Enhanced system prompt**: Explicitly tells Monica she can answer ANY question
- **Increased max tokens**: 400 → 1000 for more detailed responses

### 3. Added Personality to Monica AI
- **New traits**: Curious, helpful, occasionally uses humor, asks follow-up questions, celebrates user wins
- **Personality quirks**: Uses em-dashes, asks clarifying questions, celebrates good news
- **Customizable**: Use the PersonaEditor component to adjust Monica's personality
- **Capabilities**: General knowledge, coding, creative writing, analysis, problem-solving

### 4. Better Error Handling
- Non-JSON responses are now detected and show user-friendly errors
- API errors are logged to console for debugging
- Clear error messages if OpenAI API key is missing

---

## 🚀 Deploy to Vercel

### Step 1: Set Environment Variables in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Monica AI project
3. Go to **Settings** → **Environment Variables**
4. Add the following:

| Name | Value | Environment |
|------|-------|-------------|
| `OPENAI_API_KEY` | `sk-your-actual-openai-key` | Production, Preview, Development |

**Get your OpenAI API key**: https://platform.openai.com/api-keys

### Step 2: Deploy
**Option A: Via Vercel CLI**
```bash
vercel --prod
```

**Option B: Via Git**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import the repository in Vercel dashboard
3. Vercel will auto-deploy

**Option C: Via Vercel Dashboard**
1. Go to https://vercel.com/new
2. Drag and drop the project folder
3. Add environment variables
4. Deploy

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
npm run dev
```

4. Open http://localhost:3000 and test Monica AI!

---

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | (required) | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use (can use `gpt-4o` for even better answers) |
| `OPENAI_MAX_TOKENS` | `1000` | Maximum response length |
| `OPENAI_TEMPERATURE` | `0.7` | Creativity level (0.0-1.0) |

---

## 🎉 Monica AI is Ready!

- ✅ Can answer ANY question
- ✅ Has personality and remembers conversations
- ✅ Handles errors gracefully
- ✅ Ready for Vercel deployment
- ✅ Customizable persona via PersonaEditor

**Next step**: Add your `OPENAI_API_KEY` to Vercel and deploy!
