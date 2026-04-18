import React, { useEffect, useMemo, useRef, useState } from 'react'

const LS_HISTORY = 'abby chat history'
const LS_PERSONA = 'abby persona'

export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  // Load initial history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_HISTORY)
      if (raw) setMessages(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  // Scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const persona = useMemo(() => {
    try {
      const p = localStorage.getItem(LS_PERSONA)
      return p ? JSON.parse(p) : null
    } catch {
      return null
    }
  }, [])

  async function send(message) {
    if (!message?.trim()) return
    const userMsg = { role: 'user', content: message }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    // Persist history
    localStorage.setItem(LS_HISTORY, JSON.stringify(next))
    setLoading(true)
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
        localStorage.setItem(LS_HISTORY, JSON.stringify(updated))
      } else {
        const errorMsg = data?.error ?? 'No reply from Abby.'
        setMessages([...updated, { role: 'abby', content: errorMsg }])
      }
    } catch (err) {
      setMessages([...next, { role: 'abby', content: 'Error: could not reach Abby. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  // Expose a simple interface for child components (not necessary in this MVP but handy)
  return (
    <section aria-label="Abby chat" className="abby-chat">
      <div className="messages" aria-live="polite">
        {messages.map((m, idx) => (
          <div key={idx} className={`bubble ${m.role === 'user' ? 'user' : 'abby'}`}>
            <span>{m.content}</span>
          </div>
        ))}
        {loading && (
          <div className="bubble abby typing">Abby is typing...</div>
        )}
        <div ref={endRef} />
      </div>
      <div className="input-area" role="group" aria-label="Message input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Abby something..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') send(input)
          }}
          aria-label="Message to Abby"
        />
        <button onClick={() => send(input)} aria-label="Send">Send</button>
      </div>
    </section>
  )
}
