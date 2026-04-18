import React, { useEffect, useState } from 'react'

const LS_PERSONA = 'abby persona'

export default function PersonaEditor({}) {
  const [persona, setPersona] = useState({
    name: 'Abby AI',
    tone: 'warm, concise, a bit witty',
    loves: 'clarity, practical tips',
    dislikes: 'jargon, negativity',
    boundaries: 'no sensitive data without consent'
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
    <div className="persona-editor" aria-label="Abby Persona Editor">
      <div>
        <label>Name</label>
        <input value={persona.name} onChange={e => update({ ...persona, name: e.target.value })} />
      </div>
      <div>
        <label>Tone</label>
        <input value={persona.tone} onChange={e => update({ ...persona, tone: e.target.value })} />
      </div>
      <div>
        <label>Loves</label>
        <input value={persona.loves} onChange={e => update({ ...persona, loves: e.target.value })} />
      </div>
      <div>
        <label>Dislikes</label>
        <input value={persona.dislikes} onChange={e => update({ ...persona, dislikes: e.target.value })} />
      </div>
      <div>
        <label>Boundaries</label>
        <input value={persona.boundaries} onChange={e => update({ ...persona, boundaries: e.target.value })} />
      </div>
    </div>
  )
}
