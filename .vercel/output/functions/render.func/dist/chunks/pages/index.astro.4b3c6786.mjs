import { _ as __astro_tag_component__, c as createAstro, a as createComponent, r as renderTemplate, b as renderHead, d as renderComponent } from '../astro.9ca48163.mjs';
import 'html-escaper';
import { useState, useRef, useEffect, useMemo } from 'react';
/* empty css                           */import { jsxs, jsx } from 'react/jsx-runtime';
import 'cookie';
import 'kleur/colors';
import 'path-to-regexp';
import 'mime';
import 'string-width';

const LS_HISTORY = "abby chat history";
const LS_PERSONA = "abby persona";
const LS_CONVERSATIONS = "abby conversations";
const LS_CURRENT_CONVERSATION = "abby current conversation";
function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const endRef = useRef(null);
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(LS_CONVERSATIONS);
      const currentId = localStorage.getItem(LS_CURRENT_CONVERSATION);
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        if (currentId && parsed.find((c) => c.id === currentId)) {
          setCurrentConversationId(currentId);
          const currentConv = parsed.find((c) => c.id === currentId);
          if (currentConv) {
            setMessages(currentConv.messages);
          }
        } else if (parsed.length > 0) {
          setCurrentConversationId(parsed[0].id);
          setMessages(parsed[0].messages);
        }
      } else {
        const oldHistory = localStorage.getItem(LS_HISTORY);
        if (oldHistory) {
          const oldMessages = JSON.parse(oldHistory);
          const newConversation = {
            id: Date.now().toString(),
            title: "New Chat",
            messages: oldMessages,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          setConversations([newConversation]);
          setCurrentConversationId(newConversation.id);
          setMessages(oldMessages);
        }
      }
    } catch {
    }
  }, []);
  useEffect(() => {
    if (conversations.length > 0 && currentConversationId) {
      const updatedConversations = conversations.map((conv) => conv.id === currentConversationId ? {
        ...conv,
        messages,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      } : conv);
      setConversations(updatedConversations);
      localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations));
      localStorage.setItem(LS_CURRENT_CONVERSATION, currentConversationId);
    }
  }, [messages, currentConversationId]);
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setCurrentConversationId(newConversation.id);
    setMessages([]);
    setInput("");
    localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations));
    localStorage.setItem(LS_CURRENT_CONVERSATION, newConversation.id);
  };
  const switchConversation = (conversationId) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      setInput("");
      localStorage.setItem(LS_CURRENT_CONVERSATION, conversationId);
    }
  };
  const deleteConversation = (conversationId) => {
    if (conversations.length <= 1)
      return;
    const updatedConversations = conversations.filter((c) => c.id !== conversationId);
    setConversations(updatedConversations);
    if (currentConversationId === conversationId) {
      const nextConv = updatedConversations[0];
      setCurrentConversationId(nextConv.id);
      setMessages(nextConv.messages);
      localStorage.setItem(LS_CURRENT_CONVERSATION, nextConv.id);
    }
    localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations));
  };
  const generateConversationTitle = (message) => {
    const words = message.split(" ").slice(0, 4);
    return words.join(" ") + (message.split(" ").length > 4 ? "..." : "");
  };
  const persona = useMemo(() => {
    try {
      const p = localStorage.getItem(LS_PERSONA);
      return p ? JSON.parse(p) : null;
    } catch {
      return null;
    }
  }, []);
  async function send(message) {
    if (!message?.trim())
      return;
    if (messages.length === 0 && currentConversationId) {
      const title = generateConversationTitle(message);
      const updatedConversations = conversations.map((conv) => conv.id === currentConversationId ? {
        ...conv,
        title,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      } : conv);
      setConversations(updatedConversations);
      localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations));
    }
    const userMsg = {
      role: "user",
      content: message
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/abby-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          persona
        })
      });
      const data = await res.json();
      if (data?.reply) {
        const aiMsg = {
          role: "abby",
          content: data.reply
        };
        const updated = [...next, aiMsg];
        setMessages(updated);
        const convUpdates = conversations.map((conv) => conv.id === currentConversationId ? {
          ...conv,
          messages: updated,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        } : conv);
        setConversations(convUpdates);
        localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(convUpdates));
      } else {
        const errorMsg = data?.error ?? "Sorry, I could not get a response. Please try again.";
        const updated = [...next, {
          role: "abby",
          content: errorMsg
        }];
        setMessages(updated);
      }
    } catch (err) {
      const errorReply = "Error: Could not connect to Abby. Please check your internet connection.";
      const updated = [...next, {
        role: "abby",
        content: errorReply
      }];
      setMessages(updated);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "chatgpt-layout",
    children: [/* @__PURE__ */ jsxs("div", {
      className: `sidebar ${sidebarOpen ? "open" : "closed"}`,
      children: [/* @__PURE__ */ jsx("div", {
        className: "sidebar-header",
        children: /* @__PURE__ */ jsx("button", {
          onClick: createNewConversation,
          className: "new-chat-btn",
          children: "+ New chat"
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "conversation-list",
        children: conversations.map((conversation) => /* @__PURE__ */ jsxs("div", {
          className: `conversation-item ${currentConversationId === conversation.id ? "active" : ""}`,
          onClick: () => switchConversation(conversation.id),
          children: [/* @__PURE__ */ jsx("span", {
            className: "conversation-title",
            children: conversation.title
          }), conversations.length > 1 && /* @__PURE__ */ jsx("button", {
            onClick: (e) => {
              e.stopPropagation();
              deleteConversation(conversation.id);
            },
            className: "delete-btn",
            children: "×"
          })]
        }, conversation.id))
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "main-chat",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "chat-header",
        children: [/* @__PURE__ */ jsx("button", {
          onClick: () => setSidebarOpen(!sidebarOpen),
          className: "sidebar-toggle",
          children: "☰"
        }), /* @__PURE__ */ jsx("h3", {
          className: "chat-title",
          children: "Abby AI"
        }), /* @__PURE__ */ jsx("div", {
          className: "spacer"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "messages",
        "aria-live": "polite",
        children: [messages.map((m, idx) => /* @__PURE__ */ jsx("div", {
          className: `message-row ${m.role === "user" ? "user" : "abby"}`,
          children: /* @__PURE__ */ jsx("div", {
            className: `message-bubble ${m.role === "user" ? "user" : "abby"}`,
            children: m.content
          })
        }, idx)), loading && /* @__PURE__ */ jsx("div", {
          className: "message-row abby",
          children: /* @__PURE__ */ jsxs("div", {
            className: "typing-indicator",
            children: ["Abby AI is thinking", /* @__PURE__ */ jsx("span", {
              className: "typing-dots"
            })]
          })
        }), /* @__PURE__ */ jsx("div", {
          ref: endRef
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "input-area",
        role: "group",
        "aria-label": "Message input",
        children: /* @__PURE__ */ jsxs("div", {
          className: "input-container",
          children: [/* @__PURE__ */ jsx("input", {
            type: "text",
            value: input,
            onChange: (e) => setInput(e.target.value),
            placeholder: "Ask Abby AI anything...",
            className: "message-input",
            onKeyDown: (e) => {
              if (e.key === "Enter")
                send(input);
            },
            "aria-label": "Message to Abby"
          }), /* @__PURE__ */ jsx("button", {
            onClick: () => send(input),
            className: "send-btn",
            "aria-label": "Send",
            children: "Send"
          })]
        })
      })]
    })]
  });
}
__astro_tag_component__(ChatWindow, "@astrojs/react");

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Abby AI</title>
    <link rel="stylesheet" href="/styles.css">
  ${renderHead()}</head>
  <body>
    <main class="container">
      <header class="app-header" aria-label="App header">
        <div class="brand">
          <span class="brand-avatar">A</span>
          <h1>Abby AI</h1>
        </div>
      </header>

      <div class="chat-container">
        ${renderComponent($$result, "ChatWindow", ChatWindow, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/DELL/Desktop/FUN/src/components/ChatWindow.jsx", "client:component-export": "default" })}
      </div>
    </main>
  </body></html>`;
}, "C:/Users/DELL/Desktop/FUN/src/pages/index.astro", void 0);

const $$file = "C:/Users/DELL/Desktop/FUN/src/pages/index.astro";
const $$url = "";

export { $$Index as default, $$file as file, $$url as url };
