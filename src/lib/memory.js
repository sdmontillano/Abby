// Simple in-browser memory utilities for Monica AI
export const LS_KEYS = {
  PERSONA: 'monica persona',
  CONVERSATIONS: 'monica conversations',
  CURRENT_CONVERSATION: 'monica current conversation',
  HISTORY: 'monica chat history', // Legacy key for migration
}

export function savePersona(p) {
  localStorage.setItem(LS_KEYS.PERSONA, JSON.stringify(p))
}
export function loadPersona() {
  const raw = localStorage.getItem(LS_KEYS.PERSONA)
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}
export function saveConversations(conversations) {
  localStorage.setItem(LS_KEYS.CONVERSATIONS, JSON.stringify(conversations))
}
export function loadConversations() {
  const raw = localStorage.getItem(LS_KEYS.CONVERSATIONS)
  try { return raw ? JSON.parse(raw) : [] } catch { return [] }
}
export function saveHistory(h) {
  localStorage.setItem(LS_KEYS.HISTORY, JSON.stringify(h))
}
export function loadHistory() {
  const raw = localStorage.getItem(LS_KEYS.HISTORY)
  try { return raw ? JSON.parse(raw) : [] } catch { return [] }
}
