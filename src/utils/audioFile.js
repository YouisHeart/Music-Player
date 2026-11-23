import { formatBytes } from '@/utils/format'
import { readAudioTags } from '@/utils/id3'

const SUPPORTED = new Set(['mp3', 'flac', 'wav', 'm4a', 'mp4', 'aac', 'ogg', 'oga', 'opus', 'webm'])
const UNSUPPORTED = new Set(['wma', 'ape', 'aiff', 'aif', 'mid', 'midi', 'amr'])

export function getExtension(name = '') {
  const match = /\.([a-z0-9]+)$/i.exec(name)
  return match ? match[1].toLowerCase() : ''
}

export function isAudioFile(file) {
  if (!file) return false
  const extension = getExtension(file.name)
  if (SUPPORTED.has(extension)) return true
  if (UNSUPPORTED.has(extension)) return false
  return file.type.startsWith('audio/')
}

export function parseFileName(name) {
  const base = name.replace(/\.[^.]+$/, '').trim()
  const cleaned = base.replace(/^\s*\d{1,3}\s*[-._]\s*/, '').trim()
  const separator = cleaned.indexOf(' - ')
  if (separator > 0) {
    const artist = cleaned.slice(0, separator).trim()
    const title = cleaned.slice(separator + 3).trim()
    if (title) return { title, artist }
  }
  return { title: cleaned || base || name, artist: '' }
}

export function readAudioDuration(url, timeout = 12_000) {
  return new Promise((resolve) => {
    const audio = document.createElement('audio')
    let settled = false
    let timer

    const finish = (value) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('error', onError)
      audio.removeAttribute('src')
      resolve(value)
    }
    const onLoaded = () => {
      finish(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0)
    }
    const onError = () => finish(0)

    audio.preload = 'metadata'
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('error', onError)
    timer = window.setTimeout(() => finish(0), timeout)
    audio.src = url
  })
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local-${crypto.randomUUID()}`
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function cleanDuration(value) {
  return Number.isFinite(value) && value > 0 ? Math.round(value * 1000) / 1000 : 0
}

/**
 * Read tags/duration for a dropped file and build both the in-memory track and
 * the IndexedDB record. The object URLs created here belong to the caller and
 * must be revoked when the track is removed.
 */
export async function buildImportedTrack(file, { existingNames = new Set() } = {}) {
  if (!isAudioFile(file)) throw new Error('UNSUPPORTED_TYPE')
  if (existingNames.has(`${file.name}:${file.size}`)) throw new Error('DUPLICATE')

  const id = createId()
  const audioUrl = URL.createObjectURL(file)
  let tags = null
  try {
    tags = await readAudioTags(file)
  } catch {
    tags = null
  }

  const metadataDuration = cleanDuration(tags?.duration)
  const duration = metadataDuration || cleanDuration(await readAudioDuration(audioUrl))
  const fallback = parseFileName(file.name)
  const extension = getExtension(file.name)
  const coverUrl = tags?.coverBlob ? URL.createObjectURL(tags.coverBlob) : ''

  const track = {
    id,
    title: (tags?.title || fallback.title || file.name).trim(),
    artist: (tags?.artist || fallback.artist || '未知艺术家').trim(),
    album: (tags?.album || '本地导入').trim(),
    duration,
    cover: coverUrl,
    audio: audioUrl,
    source: 'local',
    fileName: file.name,
    fileSize: file.size,
    format: (extension || 'AUDIO').toUpperCase(),
    addedAt: Date.now(),
    year: tags?.year || '',
    genre: tags?.genre || '',
  }

  const record = {
    id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    duration: track.duration,
    fileName: file.name,
    fileSize: file.size,
    format: track.format,
    addedAt: track.addedAt,
    year: track.year,
    genre: track.genre,
    fileBlob: file,
    coverBlob: tags?.coverBlob ?? null,
    sizeLabel: formatBytes(file.size),
  }

  return { track, record }
}

/** Rebuild an in-memory track from a persisted IndexedDB record. */
export function trackFromRecord(record) {
  return {
    id: record.id,
    title: record.title || record.fileName,
    artist: record.artist || '未知艺术家',
    album: record.album || '本地导入',
    duration: record.duration || 0,
    cover: record.coverBlob ? URL.createObjectURL(record.coverBlob) : '',
    audio: URL.createObjectURL(record.fileBlob),
    source: 'local',
    fileName: record.fileName,
    fileSize: record.fileSize,
    format: record.format || 'AUDIO',
    addedAt: record.addedAt || Date.now(),
    year: record.year || '',
    genre: record.genre || '',
    sizeLabel: record.sizeLabel || formatBytes(record.fileSize || 0),
  }
}

export function revokeTrackUrls(track) {
  if (!track) return
  if (track.audio?.startsWith('blob:')) URL.revokeObjectURL(track.audio)
  if (track.cover?.startsWith('blob:')) URL.revokeObjectURL(track.cover)
}
