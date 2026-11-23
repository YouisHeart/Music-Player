/** Asset URLs must stay relative so the production build also works from file://. */
const base = import.meta.env.BASE_URL || '/'

export function assetUrl(path) {
  if (!path) return ''
  if (/^(?:https?:|data:|blob:)/i.test(path)) return path
  return `${base}${String(path).replace(/^\/+/, '')}`
}

export function absoluteUrl(path) {
  if (!path) return ''
  if (/^(?:data:|blob:)/i.test(path)) return path
  if (/^https?:/i.test(path)) return path
  try {
    return new URL(assetUrl(path), window.location.href).href
  } catch {
    return assetUrl(path)
  }
}
