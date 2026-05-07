import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/chatgpt.css'

interface Message {
  role: 'user' | 'monica'
  content: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

interface Persona {
  name?: string
  tone?: string
  goals?: string[]
  loves?: string[]
  dislikes?: string[]
  boundaries?: string[]
}

interface ApiResponse {
  reply?: string
  error?: string
}

const LS_HISTORY = 'monica chat history'
const LS_PERSONA = 'monica persona'
const LS_CONVERSATIONS = 'monica conversations'
const LS_CURRENT_CONVERSATION = 'monica current conversation'

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(LS_CONVERSATIONS)
      const currentId = localStorage.getItem(LS_CURRENT_CONVERSATION)
      
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations) as Conversation[]
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
          const oldMessages = JSON.parse(oldHistory) as Message[]
          const newConversation: Conversation = {
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
    } catch (err) {
      console.error('Error loading conversations:', err)
      setError('Failed to load conversation history')
    }
  }, [])

  // Save conversations to localStorage (only when messages change, not on currentConversationId change)
  useEffect(() => {
    if (conversations.length > 0 && currentConversationId && messages.length > 0) {
      try {
        const updatedConversations = conversations.map(conv => 
          conv.id === currentConversationId 
            ? { ...conv, messages, updatedAt: new Date().toISOString() }
            : conv
        )
        // Only update localStorage, not state (to avoid loops)
        localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations))
      } catch (err) {
        console.error('Error saving conversations:', err)
      }
    }
  }, [messages])

  // Scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Show/hide scroll-to-top button
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    
    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 300)
    }
    
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to top function
  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Create new conversation
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Use functional state updates to avoid stale closures
    setMessages([])
    setInput('')
    setError(null)
    
    setConversations(prevConversations => {
      const updatedConversations = [newConversation, ...prevConversations]
      localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations))
      return updatedConversations
    })
    
    setCurrentConversationId(newConversation.id)
    localStorage.setItem(LS_CURRENT_CONVERSATION, newConversation.id)
    setSidebarOpen(false)
  }

  // Switch to conversation
  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (conversation) {
      setCurrentConversationId(conversationId)
      setMessages(conversation.messages)
      setInput('')
      setError(null)
      localStorage.setItem(LS_CURRENT_CONVERSATION, conversationId)
    }
  }

  // Delete conversation
  const deleteConversation = (conversationId: string) => {
    if (conversations.length <= 1) return
    
    const updatedConversations = conversations.filter(c => c.id !== conversationId)
    setConversations(updatedConversations)
    
    if (currentConversationId === conversationId) {
      const nextConv = updatedConversations[0]
      if (nextConv) {
        setCurrentConversationId(nextConv.id)
        setMessages(nextConv.messages)
        localStorage.setItem(LS_CURRENT_CONVERSATION, nextConv.id)
      }
    }
    
    localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations))
  }

  // Delete individual message
  const deleteMessage = (messageIndex: number) => {
    if (messageIndex < 0 || messageIndex >= messages.length) return
    
    const updatedMessages = messages.filter((_, idx) => idx !== messageIndex)
    setMessages(updatedMessages)
    
    // Update the current conversation in the conversations array
    if (currentConversationId) {
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: updatedMessages, updatedAt: new Date().toISOString() }
          : conv
      )
      setConversations(updatedConversations)
      localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations))
    }
  }

  // Generate conversation title from first message
  const generateConversationTitle = (message: string): string => {
    const words = message.split(' ').slice(0, 4)
    return words.join(' ') + (message.split(' ').length > 4 ? '...' : '')
  }

  // Load persona
  const persona = useMemo<Persona | null>(() => {
    try {
      const p = localStorage.getItem(LS_PERSONA)
      return p ? JSON.parse(p) : null
    } catch (err) {
      console.error('Error loading persona:', err)
      return null
    }
  }, [])

  // Send message - calls OpenAI API with full conversation history
  async function send(message: string) {
    if (!message?.trim()) return
    
    setError(null)
    
    // Update conversation title if it's the first message
    if (messages.length === 0 && currentConversationId) {
      const title = generateConversationTitle(message)
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, title, updatedAt: new Date().toISOString() }
          : conv
      )
      setConversations(updatedConversations)
      localStorage.setItem(LS_CONVERSATIONS, JSON.stringify(updatedConversations))
    }
    
    const userMsg: Message = { role: 'user', content: message }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    
    // Call the API with full conversation history
    try {
      const res = await fetch('/api/abby-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, persona })
      })
      
      // Check if response is JSON before parsing
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Non-JSON response:', text.substring(0, 200))
        throw new Error('Server returned an invalid response. Please check deployment and API configuration.')
      }
      
      const data = (await res.json()) as ApiResponse
      
      if (!res.ok) {
        throw new Error(data?.error || `Server error (${res.status})`)
      }
      
      if (data?.reply) {
        const aiMsg: Message = { role: 'monica', content: data.reply }
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
        throw new Error(data?.error || 'Empty response from Monica AI')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('API Error:', err)
      
      // Don't add error as a message, just show error banner
      setError(errorMessage)
      // Revert the user message since we didn't get a response
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chatgpt-layout">
      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button onClick={() => { createNewConversation(); setSidebarOpen(false); }} className="new-chat-btn">
            + New chat
          </button>
        </div>
        
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${currentConversationId === conversation.id ? 'active' : ''}`}
              onClick={() => { switchConversation(conversation.id); setSidebarOpen(false); }}
            >
              <span className="conversation-title">{conversation.title}</span>
              {conversations.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conversation.id)
                  }}
                  className="delete-btn"
                  aria-label="Delete conversation"
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
          <h3 className="chat-title">Monica</h3>
          <div className="spacer" />
        </div>
        
        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => setError(null)} className="close-error">×</button>
          </div>
        )}
        
        <div ref={messagesContainerRef} className="messages" aria-live="polite" aria-label="Chat messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`message-row ${m.role === 'user' ? 'user' : 'monica'}`}>
              <div className={`message-bubble ${m.role === 'user' ? 'user' : 'monica'}`}>
                {m.content}
                <button
                  onClick={() => deleteMessage(idx)}
                  className="delete-msg-btn"
                  aria-label="Delete message"
                  title="Delete message"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message-row monica">
              <div className="typing-indicator">
                 Monica AI is thinking<span className="typing-dots"></span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        
        {/* Scroll to top button */}
        <button 
          className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          ↑
        </button>
        
        <div className="input-area" role="group" aria-label="Message input">
          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Monica AI anything..."
              className="message-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) send(input)
              }}
              aria-label="Message to Monica"
              disabled={loading}
            />
            <button
              onClick={() => send(input)}
              className="send-btn"
              aria-label="Send"
              disabled={loading || !input.trim()}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
