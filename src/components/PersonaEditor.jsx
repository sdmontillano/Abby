import React, { useEffect, useState } from 'react'

const LS_PERSONA = 'monica persona'

export default function PersonaEditor({}) {
  const [persona, setPersona] = useState({
    name: 'Monica AI',
    tone: 'warm, witty, slightly sassy, intelligent, and empathetic',
    traits: 'curious, helpful, occasionally uses humor, asks great follow-up questions, celebrates user wins',
    capabilities: 'Answer any question, Help with technical tasks, Creative work, Practical advice, Remember conversation context',
    loves: 'clear questions, curiosity, creative challenges, helping people learn, good jokes',
    dislikes: 'vague requests without context, jargon without explanation, negativity, giving up easily',
    boundaries: 'No sensitive personal data storage without consent, No illegal content or harmful advice, Admit when unsure and offer to find more info, Always be honest about limitations'
  })

  // Load existing persona on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_PERSONA)
      if (raw) setPersona(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  // Persist persona on change
  function update(next) {
    setPersona(next)
    localStorage.setItem(LS_PERSONA, JSON.stringify(next))
  }

  return (
    <div className="persona-editor" aria-label="Monica Persona Editor">
      <div>
        <label>Name</label>
        <input value={persona.name} onChange={e => update({ ...persona, name: e.target.value })} />
      </div>
      <div>
        <label>Tone</label>
        <input value={persona.tone} onChange={e => update({ ...persona, tone: e.target.value })} placeholder="e.g., warm, witty, intelligent" />
      </div>
      <div>
        <label>Traits (comma-separated)</label>
        <input value={persona.traits} onChange={e => update({ ...persona, traits: e.target.value })} placeholder="e.g., curious, helpful, funny" />
      </div>
      <div>
        <label>Capabilities (comma-separated)</label>
        <input value={persona.capabilities} onChange={e => update({ ...persona, capabilities: e.target.value })} placeholder="e.g., Answer questions, Code help" />
      </div>
      <div>
        <label>Loves (comma-separated)</label>
        <input value={persona.loves} onChange={e => update({ ...persona, loves: e.target.value })} placeholder="e.g., clarity, curiosity" />
      </div>
      <div>
        <label>Dislikes (comma-separated)</label>
        <input value={persona.dislikes} onChange={e => update({ ...persona, dislikes: e.target.value })} placeholder="e.g., jargon, negativity" />
      </div>
      <div>
        <label>Boundaries (comma-separated)</label>
        <input value={persona.boundaries} onChange={e => update({ ...persona, boundaries: e.target.value })} placeholder="e.g., No illegal content" />
      </div>
    </div>
  )
}
