# Abby Chat (Astro + OpenAI)

A Simsimi-like personality chatbot (Abby) built with Astro. MVP uses localStorage for persona/history and a serverless API route to forward prompts to OpenAI with a persona-injected system prompt.

Prerequisites
- Node.js >= 18
- OpenAI API key (OPENAI_API_KEY) - either in your environment or Vercel/Cloud provider settings

Project structure (high level)
- astro.config.mjs: Astro/Vercel config
- src/pages/index.astro: main page with chat UI and persona editor
- src/components/ChatWindow.jsx: chat UI and message flow
- src/components/PersonaEditor.jsx: simple persona editor (stored in localStorage)
- src/api/abby-chat.js: serverless endpoint to call OpenAI with persona-injected system prompt
- src/lib/prompts.js: helper to build the system prompt from persona
- public/styles.css: MVP styling

Deployment notes
- MVP uses Vercel as hosting target. Ensure OPENAI_API_KEY is configured in Vercel env vars.
- The MVP memory store is localStorage-based; backend memory can be added later with explicit consent.

Usage
- Run locally: npm install; npm run dev
- Deploy later to Vercel: set up a Vercel project and connect the repo.
