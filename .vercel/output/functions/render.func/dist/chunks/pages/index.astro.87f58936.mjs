import { _ as __astro_tag_component__, c as createAstro, a as createComponent, r as renderTemplate, b as renderHead, d as renderComponent } from '../astro.9ca48163.mjs';
import 'html-escaper';
import { useState, useRef, useEffect, useMemo } from 'react';
/* empty css                           */import { jsxs, jsx } from 'react/jsx-runtime';
import 'cookie';
import 'kleur/colors';
import 'path-to-regexp';
import 'mime';
import 'string-width';

const LS_HISTORY = "monica chat history";
const LS_PERSONA = "monica persona";
const LS_CONVERSATIONS = "monica conversations";
const LS_CURRENT_CONVERSATION = "monica current conversation";
function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
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
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Failed to load conversation history");
    }
  }, []);
  useEffect(() => {
    if (conversations.length > 0 && currentConversationId) {
      try {
        const updatedConversations = conversations.map((conv) => conv.id === currentConversationId ? {
          ...conv,
          messages,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        } : conv);
        setConversations(updatedConversations);
        localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations));
        localStorage.setItem(LS_CURRENT_CONVERSATION, currentConversationId);
      } catch (err) {
        console.error("Error saving conversations:", err);
      }
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
    setError(null);
    localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations));
    localStorage.setItem(LS_CURRENT_CONVERSATION, newConversation.id);
  };
  const switchConversation = (conversationId) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      setInput("");
      setError(null);
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
    } catch (err) {
      console.error("Error loading persona:", err);
      return null;
    }
  }, []);
  async function send(message) {
    if (!message?.trim())
      return;
    setError(null);
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
          messages: next,
          persona
        })
      });
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned an invalid response. Please check deployment and API configuration.");
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Server error (${res.status})`);
      }
      if (data?.reply) {
        const aiMsg = {
          role: "monica",
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
        throw new Error(data?.error || "Empty response from Monica AI");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("API Error:", err);
      setError(errorMessage);
      setMessages(messages);
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
            "aria-label": "Delete conversation",
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
          children: "Monica AI"
        }), /* @__PURE__ */ jsx("div", {
          className: "spacer"
        })]
      }), error && /* @__PURE__ */ jsxs("div", {
        className: "error-banner",
        role: "alert",
        children: [error, /* @__PURE__ */ jsx("button", {
          onClick: () => setError(null),
          className: "close-error",
          children: "×"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "messages",
        "aria-live": "polite",
        "aria-label": "Chat messages",
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
            children: ["Monica AI is thinking", /* @__PURE__ */ jsx("span", {
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
            placeholder: "Ask Monica AI anything...",
            className: "message-input",
            onKeyDown: (e) => {
              if (e.key === "Enter" && !loading)
                send(input);
            },
            "aria-label": "Message to Monica",
            disabled: loading
          }), /* @__PURE__ */ jsx("button", {
            onClick: () => send(input),
            className: "send-btn",
            "aria-label": "Send",
            disabled: loading || !input.trim(),
            children: loading ? "Sending..." : "Send"
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
    <title>Monica AI</title>
    <link rel="stylesheet" href="/styles.css">
  ${renderHead()}</head>
  <body>
    <main class="container">
      <header class="app-header" aria-label="App header">
        <div class="brand">
          <span class="brand-avatar">M</span>
          <h1>Monica AI</h1>
        </div>
      </header>

      <div class="chat-container">
        ${renderComponent($$result, "ChatWindow", ChatWindow, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/DELL/Desktop/FUN/src/components/ChatWindow.tsx", "client:component-export": "default" })}
      </div>
    </main>
  </body></html>`;
}, "C:/Users/DELL/Desktop/FUN/src/pages/index.astro", void 0);

const $$file = "C:/Users/DELL/Desktop/FUN/src/pages/index.astro";
const $$url = "";

export { $$Index as default, $$file as file, $$url as url };
