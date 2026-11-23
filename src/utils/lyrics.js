const TIME_TAG = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g
const META_TAG = /^\[(ar|ti|al|by|offset|length|re|ve):(.*)\]$/i

/**
 * Parse a standard LRC document into time-sorted lines.
 * Supports multiple timestamps per line and `[offset:ms]`.
 */
export function parseLrc(text) {
  if (!text || typeof text !== 'string') return []
  let offset = 0
  const lines = []

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    const meta = line.match(META_TAG)
    if (meta) {
      if (meta[1].toLowerCase() === 'offset') {
        const parsed = Number.parseInt(meta[2], 10)
        if (Number.isFinite(parsed)) offset = parsed / 1000
      }
      continue
    }

    TIME_TAG.lastIndex = 0
    const timestamps = []
    let match
    while ((match = TIME_TAG.exec(line))) {
      const minutes = Number.parseInt(match[1], 10)
      const seconds = Number.parseInt(match[2], 10)
      const fractionRaw = match[3] ?? '0'
      const fraction = Number.parseInt(fractionRaw, 10) / 10 ** fractionRaw.length
      timestamps.push(minutes * 60 + seconds + fraction)
    }
    if (!timestamps.length) continue

    const content = line.replace(TIME_TAG, '').replace(/\s+/g, ' ').trim()
    if (!content) continue
    for (const time of timestamps) {
      lines.push({ time: Math.max(0, time + offset), text: content })
    }
  }

  return lines.sort((a, b) => a.time - b.time)
}

/** Binary search for the line active at `time` (seconds). */
export function findActiveLine(lines, time) {
  if (!lines?.length) return -1
  let low = 0
  let high = lines.length - 1
  let result = -1
  while (low <= high) {
    const middle = (low + high) >> 1
    if (lines[middle].time <= time + 0.05) {
      result = middle
      low = middle + 1
    } else {
      high = middle - 1
    }
  }
  return result
}
