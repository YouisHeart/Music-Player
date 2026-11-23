export function normalizeHex(input, fallback = '#4f8dff') {
  if (typeof input !== 'string') return fallback
  let value = input.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(value)) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('')
  }
  return /^[0-9a-f]{6}$/i.test(value) ? `#${value.toLowerCase()}` : fallback
}

export function hexToRgb(input) {
  const hex = normalizeHex(input).slice(1)
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

export function rgbToHex(r, g, b) {
  const toHex = (value) => Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function rgbTriplet(hex) {
  const { r, g, b } = hexToRgb(hex)
  return `${r}, ${g}, ${b}`
}

function rgbToHsl(r, g, b) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const lightness = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: lightness }
  const delta = max - min
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let hue
  if (max === rn) hue = (gn - bn) / delta + (gn < bn ? 6 : 0)
  else if (max === gn) hue = (bn - rn) / delta + 2
  else hue = (rn - gn) / delta + 4
  return { h: hue * 60, s: saturation, l: lightness }
}

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360
  const chroma = (1 - Math.abs(2 * l - 1)) * s
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = l - chroma / 2
  let r = 0
  let g = 0
  let b = 0
  if (hue < 60) [r, g, b] = [chroma, x, 0]
  else if (hue < 120) [r, g, b] = [x, chroma, 0]
  else if (hue < 180) [r, g, b] = [0, chroma, x]
  else if (hue < 240) [r, g, b] = [0, x, chroma]
  else if (hue < 300) [r, g, b] = [x, 0, chroma]
  else [r, g, b] = [chroma, 0, x]
  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  }
}

/** Rotate the hue of a hex colour while keeping it in a pleasant neon band. */
export function shiftHue(hex, degrees, { saturation = 1, lightness = 1 } = {}) {
  const { r, g, b } = hexToRgb(hex)
  const hsl = rgbToHsl(r, g, b)
  const next = hslToRgb(
    hsl.h + degrees,
    Math.min(1, Math.max(0.45, hsl.s * saturation)),
    Math.min(0.78, Math.max(0.34, hsl.l * lightness)),
  )
  return rgbToHex(next.r, next.g, next.b)
}
