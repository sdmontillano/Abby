// Simple in-browser memory utilities for MVP (can be extended later)
export const LS_KEYS = {
  PERSONA: 'abby persona',
  HISTORY: 'abby chat history',
}

export function savePersona(p) {
  localStorage.setItem(LS_KEYS.PERSONA, JSON.stringify(p))
}
export function loadPersona() {
  const raw = localStorage.getItem(LS_KEYS.PERSONA)
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}
export function saveHistory(h) {
  localStorage.setItem(LS_KEYS.HISTORY, JSON.stringify(h))
}
export function loadHistory() {
  const raw = localStorage.getItem(LS_KEYS.HISTORY)
  try { return raw ? JSON.parse(raw) : [] } catch { return [] }
}
