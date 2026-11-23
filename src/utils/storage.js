const PREFIX = 'cyber-player:'

function clone(value) {
  if (value === undefined || value === null) return value
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      /* fall through */
    }
  }
  return JSON.parse(JSON.stringify(value))
}

export function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : clone(fallback)
  } catch {
    return clone(fallback)
  }
}

export function writeJson(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
