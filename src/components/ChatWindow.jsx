import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/chatgpt.css'

const LS_HISTORY = 'abby chat history'
const LS_PERSONA = 'abby persona'
const LS_CONVERSATIONS = 'abby conversations'
const LS_CURRENT_CONVERSATION = 'abby current conversation'

export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const endRef = useRef(null)

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(LS_CONVERSATIONS)
      const currentId = localStorage.getItem(LS_CURRENT_CONVERSATION)
      
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations)
        setConversations(parsed)
        
        if (currentId && parsed.find(c => c.id === currentId)) {
          setCurrentConversationId(currentId)
          const currentConv = parsed.find(c => c.id === currentId)
          if (currentConv) {
            setMessages(currentConv.messages)
          }
        } else if (parsed.length > 0) {
          setCurrentConversationId(parsed[0].id)
          setMessages(parsed[0].messages)
        }
      } else {
        const oldHistory = localStorage.getItem(LS_HISTORY)
        if (oldHistory) {
          const oldMessages = JSON.parse(oldHistory)
          const newConversation = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: oldMessages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          setConversations([newConversation])
          setCurrentConversationId(newConversation.id)
          setMessages(oldMessages)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0 && currentConversationId) {
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages, updatedAt: new Date().toISOString() }
          : conv
      )
      setConversations(updatedConversations)
      localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations))
      localStorage.setItem(LS_CURRENT_CONVERSATION, currentConversationId)
    }
  }, [messages, currentConversationId])

  // Scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Create new conversation
  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedConversations = [newConversation, ...conversations]
    setConversations(updatedConversations)
    setCurrentConversationId(newConversation.id)
    setMessages([])
    setInput('')
    
    localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations))
    localStorage.setItem(LS_CURRENT_CONVERSATION, newConversation.id)
  }

  // Switch to conversation
  const switchConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (conversation) {
      setCurrentConversationId(conversationId)
      setMessages(conversation.messages)
      setInput('')
      localStorage.setItem(LS_CURRENT_CONVERSATION, conversationId)
    }
  }

  // Delete conversation
  const deleteConversation = (conversationId) => {
    if (conversations.length <= 1) return
    
    const updatedConversations = conversations.filter(c => c.id !== conversationId)
    setConversations(updatedConversations)
    
    if (currentConversationId === conversationId) {
      const nextConv = updatedConversations[0]
      setCurrentConversationId(nextConv.id)
      setMessages(nextConv.messages)
      localStorage.setItem(LS_CURRENT_CONVERSATION, nextConv.id)
    }
    
    localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations))
  }

  // Generate conversation title from first message
  const generateConversationTitle = (message) => {
    const words = message.split(' ').slice(0, 4)
    return words.join(' ') + (message.split(' ').length > 4 ? '...' : '')
  }

  // Load persona
  const persona = useMemo(() => {
    try {
      const p = localStorage.getItem(LS_PERSONA)
      return p ? JSON.parse(p) : null
    } catch {
      return null
    }
  }, [])

  // Send message - calls OpenAI API
  async function send(message) {
    if (!message?.trim()) return
    
    // Update conversation title if it's the first message
    if (messages.length === 0 && currentConversationId) {
      const title = generateConversationTitle(message);
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, title, updatedAt: new Date().toISOString() }
          : conv
      )
      setConversations(updatedConversations)
      localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations))
    }
    
    const userMsg = { role: 'user', content: message }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    
    // Call the API
    try {
      const res = await fetch('/api/abby-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, persona })
      })
      const data = await res.json()
      
      if (data?.reply) {
        const aiMsg = { role: 'abby', content: data.reply }
        const updated = [...next, aiMsg]
        setMessages(updated)
        const convUpdates = conversations.map(conv => 
          conv.id === currentConversationId 
            ? { ...conv, messages: updated, updatedAt: new Date().toISOString() }
            : conv
        )
        setConversations(convUpdates)
        localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(convUpdates))
      } else {
        const errorMsg = data?.error ?? 'Sorry, I could not get a response. Please try again.'
        const updated = [...next, { role: 'abby', content: errorMsg }]
        setMessages(updated)
      }
    } catch (err) {
      const errorReply = 'Error: Could not connect to Abby. Please check your internet connection.'
      const updated = [...next, { role: 'abby', content: errorReply }]
      setMessages(updated)
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chatgpt-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button onClick={createNewConversation} className="new-chat-btn">
            + New chat
          </button>
        </div>
        
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${currentConversationId === conversation.id ? 'active' : ''}`}
              onClick={() => switchConversation(conversation.id)}
            >
              <span className="conversation-title">{conversation.title}</span>
              {conversations.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conversation.id)
                  }}
                  className="delete-btn"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="main-chat">
        <div className="chat-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-toggle">
            ☰
          </button>
          <h3 className="chat-title">Abby AI</h3>
          <div className="spacer" />
        </div>
        
        <div className="messages" aria-live="polite">
          {messages.map((m, idx) => (
            <div key={idx} className={`message-row ${m.role === 'user' ? 'user' : 'abby'}`}>
              <div className={`message-bubble ${m.role === 'user' ? 'user' : 'abby'}`}>
                {m.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message-row abby">
              <div className="typing-indicator">
                Abby AI is thinking<span className="typing-dots"></span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        
        <div className="input-area" role="group" aria-label="Message input">
          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Abby AI anything..."
              className="message-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') send(input)
              }}
              aria-label="Message to Abby"
            />
            <button
              onClick={() => send(input)}
              className="send-btn"
              aria-label="Send"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}