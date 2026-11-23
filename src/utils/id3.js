/**
 * Minimal, dependency-free audio tag reader.
 *
 * Supported:
 *  - MP3  : ID3v2.2 / v2.3 / v2.4 text frames + APIC artwork, ID3v1 fallback
 *  - FLAC : Vorbis comments, PICTURE block and STREAMINFO duration
 *
 * Anything malformed is ignored rather than thrown: importing a file must
 * never fail just because its tags are unusual.
 */

const TEXT_FRAMES = {
  TIT2: 'title',
  TPE1: 'artist',
  TALB: 'album',
  TDRC: 'year',
  TYER: 'year',
  TCON: 'genre',
  TRCK: 'track',
}

const TEXT_FRAMES_V22 = {
  TT2: 'title',
  TP1: 'artist',
  TAL: 'album',
  TYE: 'year',
  TCO: 'genre',
  TRK: 'track',
}

export async function readAudioTags(file) {
  try {
    const headSize = Math.min(file.size, 4 * 1024 * 1024)
    const head = new Uint8Array(await file.slice(0, headSize).arrayBuffer())

    if (head.length >= 3 && head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33) {
      return parseId3v2(head)
    }
    if (head.length >= 4 && head[0] === 0x66 && head[1] === 0x4c && head[2] === 0x61 && head[3] === 0x43) {
      return parseFlac(head)
    }
    if (file.size > 128) {
      const tail = new Uint8Array(await file.slice(file.size - 128).arrayBuffer())
      if (tail[0] === 0x54 && tail[1] === 0x41 && tail[2] === 0x47) return parseId3v1(tail)
    }
  } catch {
    /* tags are best effort */
  }
  return null
}

function ascii(bytes, offset, length) {
  let value = ''
  for (let index = 0; index < length; index += 1) {
    const code = bytes[offset + index]
    if (code === undefined) break
    value += String.fromCharCode(code)
  }
  return value
}

function syncSafe(bytes, offset) {
  return (
    ((bytes[offset] & 0x7f) << 21) |
    ((bytes[offset + 1] & 0x7f) << 14) |
    ((bytes[offset + 2] & 0x7f) << 7) |
    (bytes[offset + 3] & 0x7f)
  )
}

function uint32(bytes, offset) {
  return (
    ((bytes[offset] & 0xff) * 0x1000000 +
      ((bytes[offset + 1] & 0xff) << 16) +
      ((bytes[offset + 2] & 0xff) << 8) +
      (bytes[offset + 3] & 0xff)) >>>
    0
  )
}

function decodeText(bytes, encoding) {
  if (!bytes?.length) return ''
  let decoder
  try {
    if (encoding === 0) decoder = new TextDecoder('windows-1252')
    else if (encoding === 2) decoder = new TextDecoder('utf-16be')
    else if (encoding === 3) decoder = new TextDecoder('utf-8')
    else {
      const littleEndian = !(bytes[0] === 0xfe && bytes[1] === 0xff)
      decoder = new TextDecoder(littleEndian ? 'utf-16le' : 'utf-16be')
      if (bytes[0] === 0xff || bytes[0] === 0xfe) bytes = bytes.subarray(2)
    }
    return decoder
      .decode(bytes)
      .replace(/\u0000/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  } catch {
    return ''
  }
}

function findTerminator(bytes, start, wide) {
  if (wide) {
    for (let index = start; index + 1 < bytes.length; index += 2) {
      if (bytes[index] === 0 && bytes[index + 1] === 0) return index
    }
    return -1
  }
  for (let index = start; index < bytes.length; index += 1) {
    if (bytes[index] === 0) return index
  }
  return -1
}

function parsePicture(bytes, offset, version) {
  try {
    const encoding = bytes[offset]
    let cursor = offset + 1
    let mime = ''

    if (version === 2) {
      mime = ascii(bytes, cursor, 3)
      mime = mime.toLowerCase() === 'jpg' ? 'image/jpeg' : 'image/png'
      cursor += 3
    } else {
      const mimeEnd = findTerminator(bytes, cursor, false)
      if (mimeEnd < 0) return null
      mime = ascii(bytes, cursor, mimeEnd - cursor) || 'image/jpeg'
      cursor = mimeEnd + 1
    }

    cursor += 1 // picture type

    const wide = encoding === 1 || encoding === 2
    const descriptionEnd = findTerminator(bytes, cursor, wide)
    if (descriptionEnd < 0) return null
    cursor = descriptionEnd + (wide ? 2 : 1)

    const data = bytes.subarray(cursor)
    if (data.length < 32) return null
    const detected = sniffMime(data)
    return new Blob([data], { type: detected || mime || 'image/jpeg' })
  } catch {
    return null
  }
}

function sniffMime(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif'
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return 'image/webp'
  return ''
}

function parseId3v2(bytes) {
  const version = bytes[3]
  if (version < 2 || version > 4) return null
  const tagSize = syncSafe(bytes, 6)
  const end = Math.min(bytes.length, 10 + tagSize)
  const tags = { title: '', artist: '', album: '', year: '', genre: '', track: '', coverBlob: null, duration: 0 }
  let offset = 10

  if (version === 2) {
    while (offset + 6 <= end) {
      const id = ascii(bytes, offset, 3)
      if (!/^[A-Z0-9]{3}$/.test(id)) break
      const size = (bytes[offset + 3] << 16) | (bytes[offset + 4] << 8) | bytes[offset + 5]
      const start = offset + 6
      if (size <= 0 || start + size > end) break
      const data = bytes.subarray(start, start + size)
      if (id === 'PIC') {
        tags.coverBlob = tags.coverBlob || parsePicture(bytes, start, 2)
      } else if (TEXT_FRAMES_V22[id]) {
        tags[TEXT_FRAMES_V22[id]] = decodeText(data.subarray(1), data[0])
      }
      offset = start + size
    }
    return tags
  }

  while (offset + 10 <= end) {
    const id = ascii(bytes, offset, 4)
    if (!/^[A-Z0-9]{4}$/.test(id)) break
    const size = version === 4 ? syncSafe(bytes, offset + 4) : uint32(bytes, offset + 4)
    const start = offset + 10
    if (size <= 0 || start + size > end) break
    const data = bytes.subarray(start, start + size)

    if (id === 'APIC') {
      tags.coverBlob = tags.coverBlob || parsePicture(bytes, start, 3)
    } else if (TEXT_FRAMES[id]) {
      tags[TEXT_FRAMES[id]] = decodeText(data.subarray(1), data[0])
    }

    offset = start + size
  }

  return tags
}

function parseId3v1(bytes) {
  const read = (start, length) => decodeText(bytes.subarray(start, start + length), 0)
  return {
    title: read(3, 30),
    artist: read(33, 30),
    album: read(63, 30),
    year: read(93, 4),
    genre: '',
    track: bytes[125] === 0 ? String(bytes[126] || '') : '',
    coverBlob: null,
    duration: 0,
  }
}

function parseFlac(bytes) {
  const tags = { title: '', artist: '', album: '', year: '', genre: '', track: '', coverBlob: null, duration: 0 }
  let offset = 4
  let isLast = false

  while (!isLast && offset + 4 <= bytes.length) {
    const header = bytes[offset]
    isLast = Boolean(header & 0x80)
    const type = header & 0x7f
    const length = (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]
    const start = offset + 4
    if (length <= 0 || start + length > bytes.length) break

    if (type === 0 && length >= 18) {
      const data = bytes.subarray(start, start + length)
      const sampleRate = (data[10] << 12) | (data[11] << 4) | (data[12] >> 4)
      const totalSamples =
        (data[13] & 0x0f) * 4294967296 +
        ((data[14] << 24) >>> 0) +
        (data[15] << 16) +
        (data[16] << 8) +
        data[17]
      if (sampleRate > 0 && totalSamples > 0) tags.duration = totalSamples / sampleRate
    }

    if (type === 4) {
      parseVorbisComment(bytes.subarray(start, start + length), tags)
    }

    if (type === 6) {
      tags.coverBlob = parseFlacPicture(bytes.subarray(start, start + length)) || tags.coverBlob
    }

    offset = start + length
  }

  return tags
}

function parseVorbisComment(data, tags) {
  try {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
    let offset = 0
    const vendorLength = view.getUint32(offset, true)
    offset += 4 + vendorLength
    const count = view.getUint32(offset, true)
    offset += 4
    const decoder = new TextDecoder('utf-8')
    for (let index = 0; index < count && offset + 4 <= data.length; index += 1) {
      const length = view.getUint32(offset, true)
      offset += 4
      if (offset + length > data.length) break
      const entry = decoder.decode(data.subarray(offset, offset + length))
      offset += length
      const separator = entry.indexOf('=')
      if (separator < 0) continue
      const key = entry.slice(0, separator).toUpperCase()
      const value = entry.slice(separator + 1).trim()
      if (key === 'TITLE') tags.title = value
      else if (key === 'ARTIST') tags.artist = value
      else if (key === 'ALBUM') tags.album = value
      else if (key === 'DATE') tags.year = value.slice(0, 4)
      else if (key === 'GENRE') tags.genre = value
      else if (key === 'TRACKNUMBER') tags.track = value
    }
  } catch {
    /* ignore malformed comment blocks */
  }
}

function parseFlacPicture(data) {
  try {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
    let offset = 4 // picture type
    const mimeLength = view.getUint32(offset, true)
    offset += 4
    const mime = new TextDecoder('utf-8').decode(data.subarray(offset, offset + mimeLength))
    offset += mimeLength
    const descriptionLength = view.getUint32(offset, true)
    offset += 4 + descriptionLength
    offset += 16 // width, height, depth, colors
    const dataLength = view.getUint32(offset, true)
    offset += 4
    if (dataLength <= 0 || offset + dataLength > data.length) return null
    const picture = data.subarray(offset, offset + dataLength)
    return new Blob([picture], { type: sniffMime(picture) || mime || 'image/jpeg' })
  } catch {
    return null
  }
}
