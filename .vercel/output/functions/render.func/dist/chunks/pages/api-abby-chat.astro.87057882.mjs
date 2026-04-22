import { c as createAstro, a as createComponent, r as renderTemplate } from '../astro.9ca48163.mjs';
import 'html-escaper';
import 'cookie';
import 'kleur/colors';
import 'path-to-regexp';
import 'mime';
import 'string-width';

const $$Astro = createAstro();
const prerender = false;
async function POST({ request }) {
  try {
    const { message } = await request.json();
    let reply = "";
    if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
      reply = "Hello! I'm Abby AI. How can I help you today?";
    } else if (message.toLowerCase().includes("kamusta") || message.toLowerCase().includes("kumusta")) {
      reply = "Kamusta! Ako si Abby AI. Paano kita matutulungan?";
    } else if (message.toLowerCase().includes("how are you")) {
      reply = "I'm doing great, thanks for asking! I'm here to help you with anything you need.";
    } else {
      reply = "Thanks for your message! I'm Abby AI and I'm here to help. What would you like to know?";
    }
    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
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
const $$ApiAbbyChat = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ApiAbbyChat;
  return renderTemplate``;
}, "C:/Users/DELL/Desktop/FUN/src/pages/api-abby-chat.astro", void 0);

const $$file = "C:/Users/DELL/Desktop/FUN/src/pages/api-abby-chat.astro";
const $$url = "/api-abby-chat";

export { GET, POST, $$ApiAbbyChat as default, $$file as file, prerender, $$url as url };
