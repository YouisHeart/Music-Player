import { computed, ref, watch } from 'vue'

import { defineStore } from 'pinia'

import { audioEngine } from '@/core/audioEngine'
import { absoluteUrl } from '@/utils/asset'
import { clamp } from '@/utils/format'
import { readJson, writeJson } from '@/utils/storage'

import { useLibraryStore } from './library'
import { useSettingsStore } from './settings'
import { useUiStore } from './ui'

const LAST_PLAYBACK_KEY = 'last-playback-v1'
const VOLUME_KEY = 'volume-v1'
const MUTED_KEY = 'muted-v1'

function playableSrc(track) {
  if (!track) return ''
  return track.audio || ''
}

export const usePlayerStore = defineStore('player', () => {
  const library = useLibraryStore()
  const settings = useSettingsStore()
  const ui = useUiStore()
  const engine = audioEngine
  const audio = engine.audio

  const currentId = ref('')
  const loadedId = ref('')
  const isPlaying = ref(false)
  const buffering = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const buffered = ref(0)
  const error = ref('')
  const queueIds = ref([])
  const queueIsLibrary = ref(true)
  const shuffle = ref(Boolean(settings.settings.shuffle))
  const repeatMode = ref(settings.settings.repeatMode)
  const volume = ref(clamp(Number(readJson(VOLUME_KEY, settings.settings.defaultVolume)) || 0.72, 0, 1))
  const muted = ref(Boolean(readJson(MUTED_KEY, false)))

  let pendingSeek = 0
  let lastPositionSave = 0
  let lastPositionState = 0
  let initialized = false
  let mediaSessionReady = false
  let pendingRestore = null
  let userStartedPlayback = false

  const currentTrack = computed(() => library.trackById[currentId.value] || null)
  const queue = computed(() => queueIds.value.map((id) => library.trackById[id]).filter(Boolean))
  const currentIndex = computed(() => queueIds.value.indexOf(currentId.value))
  const progress = computed(() =>
    duration.value > 0 ? clamp(currentTime.value / duration.value, 0, 1) : 0,
  )
  const playableDuration = computed(() => duration.value || currentTrack.value?.duration || 0)
  const isMuted = computed(() => muted.value || volume.value === 0)
  const repeatLabel = computed(
    () =>
      ({
        off: '顺序播放',
        all: '列表循环',
        one: '单曲循环',
      })[repeatMode.value],
  )

  function formatTrackDuration(track) {
    return track?.duration || 0
  }

  function updateMetadata(track) {
    if (!track) return
    if ('mediaSession' in navigator) {
      try {
        const artwork = track.cover
          ? [
              {
                src: absoluteUrl(track.cover),
                sizes: '512x512',
                type: track.cover.includes('.webp') || track.cover.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg',
              },
            ]
          : []
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album,
          artwork,
        })
      } catch {
        /* Media Session metadata is an enhancement */
      }
    }
    updatePositionState()
  }

  function updatePositionState(force = false) {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return
    const now = Date.now()
    if (!force && now - lastPositionState < 900) return
    lastPositionState = now
    const total = playableDuration.value
    if (!total || total <= 0) return
    try {
      navigator.mediaSession.setPositionState({
        duration: total,
        playbackRate: 1,
        position: clamp(currentTime.value, 0, total),
      })
    } catch {
      /* ignore invalid intermediate states */
    }
  }

  function updatePlaybackState() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying.value ? 'playing' : 'paused'
    }
  }

  function persistPosition(force = false) {
    if (!currentId.value) return
    const now = Date.now()
    if (!force && now - lastPositionSave < 4000) return
    lastPositionSave = now
    writeJson(LAST_PLAYBACK_KEY, {
      trackId: currentId.value,
      time: Number(currentTime.value.toFixed(2)),
    })
  }

  function updateBuffered() {
    try {
      const ranges = audio.buffered
      let end = 0
      for (let index = 0; index < ranges.length; index += 1) {
        if (ranges.start(index) <= audio.currentTime + 0.3) end = Math.max(end, ranges.end(index))
      }
      buffered.value = end
    } catch {
      buffered.value = 0
    }
  }

  function onTimeUpdate() {
    currentTime.value = audio.currentTime
    updateBuffered()
    persistPosition()
    updatePositionState()
  }

  function onLoadedMetadata() {
    const mediaDuration = audio.duration
    if (Number.isFinite(mediaDuration) && mediaDuration > 0) {
      duration.value = mediaDuration
    }
    if (pendingSeek > 0) {
      const target = clamp(pendingSeek, 0, Math.max(0, duration.value - 0.25))
      try {
        audio.currentTime = target
        currentTime.value = target
      } catch {
        /* ignore */
      }
      pendingSeek = 0
    }
    updatePositionState(true)
  }

  function onPlay() {
    isPlaying.value = true
    buffering.value = false
    error.value = ''
    updatePlaybackState()
  }

  function onPause() {
    isPlaying.value = false
    updatePlaybackState()
    persistPosition(true)
  }

  function onWaiting() {
    buffering.value = true
  }

  function onPlaying() {
    buffering.value = false
    error.value = ''
  }

  function onError() {
    if (!currentId.value) return
    if (!audio.getAttribute('src')) return
    const code = audio.error?.code
    const messages = {
      1: '播放被中止',
      2: '读取音频时发生网络错误',
      3: '音频解码失败',
      4: '浏览器不支持该音频格式',
    }
    error.value = messages[code] || '音频播放失败'
    isPlaying.value = false
    buffering.value = false
    ui.toast(error.value, 'error', 3600)
  }

  function onEnded() {
    isPlaying.value = false
    if (repeatMode.value === 'one') {
      seekTo(0)
      playTrack(currentTrack.value)
      return
    }
    if (!settings.settings.autoplay) {
      currentTime.value = playableDuration.value
      persistPosition(true)
      return
    }
    next({ auto: true }).then((moved) => {
      if (!moved) {
        currentTime.value = playableDuration.value
        persistPosition(true)
      }
    })
  }

  audio.addEventListener('timeupdate', onTimeUpdate)
  audio.addEventListener('loadedmetadata', onLoadedMetadata)
  audio.addEventListener('durationchange', onLoadedMetadata)
  audio.addEventListener('play', onPlay)
  audio.addEventListener('pause', onPause)
  audio.addEventListener('waiting', onWaiting)
  audio.addEventListener('playing', onPlaying)
  audio.addEventListener('canplay', onPlaying)
  audio.addEventListener('ended', onEnded)
  audio.addEventListener('error', onError)

  function setupMediaSession() {
    if (mediaSessionReady || !('mediaSession' in navigator)) return
    mediaSessionReady = true
    const handlers = {
      play: () => {
        if (!isPlaying.value) playTrack(currentTrack.value)
      },
      pause: () => pause(),
      previoustrack: () => prev(),
      nexttrack: () => next(),
      stop: () => pause(),
      seekbackward: (details) => seekTo(currentTime.value - (details?.seekOffset || 10)),
      seekforward: (details) => seekTo(currentTime.value + (details?.seekOffset || 10)),
      seekto: (details) => {
        if (Number.isFinite(details?.seekTime)) seekTo(details.seekTime)
      },
    }
    for (const [action, handler] of Object.entries(handlers)) {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        /* unsupported action on this platform */
      }
    }
  }

  async function init() {
    if (initialized) return
    setupMediaSession()
    queueIds.value = library.tracks.map((track) => track.id)
    queueIsLibrary.value = true
    engine.setVolume(volume.value)
    engine.setMuted(muted.value)
    engine.setEqualizer(settings.settings.eq)

    const last = settings.settings.restoreLast ? readJson(LAST_PLAYBACK_KEY, null) : null
    const restoredTrack = last && library.trackById[last.trackId] ? library.trackById[last.trackId] : null
    if (last && last.trackId && !restoredTrack) pendingRestore = last
    const first = restoredTrack || library.tracks[0] || null

    if (first) {
      currentId.value = first.id
      loadedId.value = first.id
      duration.value = formatTrackDuration(first)
      pendingSeek = restoredTrack && Number.isFinite(last.time) ? Math.max(0, last.time) : 0
      currentTime.value = pendingSeek
      engine.load(playableSrc(first))
      updateMetadata(first)
    }

    initialized = true
  }

  function ensureQueue(track) {
    if (!track) return
    if (!queueIds.value.includes(track.id)) {
      queueIds.value = [track.id, ...queueIds.value.filter((id) => library.trackById[id])]
      queueIsLibrary.value = false
    }
  }

  async function playTrack(track = null, contextIds = null) {
    userStartedPlayback = true
    let target = track || currentTrack.value
    if (!target) {
      target = queue.value[0] || library.tracks[0]
      if (!target) return
    }

    if (Array.isArray(contextIds) && contextIds.length) {
      const valid = contextIds.filter((id) => library.trackById[id])
      if (valid.length) {
        queueIds.value = valid
        queueIsLibrary.value =
          valid.length === library.tracks.length && valid.every((id, index) => id === library.tracks[index].id)
      }
    }

    ensureQueue(target)

    if (loadedId.value !== target.id) {
      currentId.value = target.id
      loadedId.value = target.id
      duration.value = formatTrackDuration(target)
      currentTime.value = 0
      buffered.value = 0
      pendingSeek = 0
      error.value = ''
      engine.load(playableSrc(target))
      updateMetadata(target)
    } else {
      currentId.value = target.id
    }

    if (audio.ended || (playableDuration.value > 0 && audio.currentTime >= playableDuration.value - 0.05)) {
      seekTo(0)
    }

    try {
      await engine.play()
      error.value = ''
    } catch (playError) {
      if (playError?.name === 'AbortError') return
      error.value = playError?.name === 'NotAllowedError' ? '浏览器阻止了自动播放，请点击播放按钮' : '无法开始播放'
      ui.toast(error.value, 'error', 3200)
      isPlaying.value = false
    }
  }

  async function toggle() {
    if (!currentTrack.value) {
      await playTrack(library.tracks[0])
      return
    }
    if (isPlaying.value) {
      pause()
    } else {
      await playTrack(currentTrack.value)
    }
  }

  function pause() {
    engine.pause()
  }

  function seekTo(seconds) {
    const total = playableDuration.value
    const target = clamp(Number(seconds) || 0, 0, total || 0)
    engine.seek(target)
    currentTime.value = target
    updateBuffered()
    updatePositionState(true)
  }

  function setVolume(value) {
    const next = clamp(Number(value) || 0, 0, 1)
    volume.value = next
    writeJson(VOLUME_KEY, next)
    engine.setVolume(next)
    if (next > 0 && muted.value) {
      muted.value = false
      writeJson(MUTED_KEY, false)
      engine.setMuted(false)
    }
  }

  function toggleMute() {
    muted.value = !muted.value
    writeJson(MUTED_KEY, muted.value)
    engine.setMuted(muted.value)
  }

  function toggleShuffle() {
    shuffle.value = !shuffle.value
    settings.settings.shuffle = shuffle.value
    ui.toast(shuffle.value ? '随机播放已开启' : '随机播放已关闭', 'info', 1800)
  }

  function cycleRepeat() {
    const order = ['off', 'all', 'one']
    const index = order.indexOf(repeatMode.value)
    repeatMode.value = order[(index + 1) % order.length]
    settings.settings.repeatMode = repeatMode.value
    ui.toast(repeatLabel.value, 'info', 1600)
  }

  function setQueue(ids) {
    const valid = Array.from(new Set(ids)).filter((id) => library.trackById[id])
    queueIds.value = valid
    queueIsLibrary.value =
      valid.length === library.tracks.length && valid.every((id, index) => id === library.tracks[index].id)
  }

  function pickShuffleTarget(excludeId) {
    const candidates = queueIds.value.filter((id) => id !== excludeId)
    if (!candidates.length) return null
    return candidates[Math.floor(Math.random() * candidates.length)]
  }

  async function next({ auto = false } = {}) {
    const ids = queueIds.value
    if (!ids.length) return false
    const index = ids.indexOf(currentId.value)
    let targetId = null

    if (shuffle.value) {
      targetId = pickShuffleTarget(currentId.value)
    } else if (index === -1) {
      targetId = ids[0]
    } else if (index < ids.length - 1) {
      targetId = ids[index + 1]
    } else if (!auto || repeatMode.value === 'all') {
      targetId = ids[0]
    }

    if (!targetId) return false
    const target = library.trackById[targetId]
    if (!target) return false
    await playTrack(target)
    return true
  }

  async function prev() {
    if (!queueIds.value.length) return false
    if (currentTime.value > 3) {
      seekTo(0)
      return true
    }
    const ids = queueIds.value
    const index = ids.indexOf(currentId.value)
    let targetId
    if (shuffle.value) {
      targetId = pickShuffleTarget(currentId.value)
    } else if (index > 0) {
      targetId = ids[index - 1]
    } else {
      targetId = ids[ids.length - 1]
    }
    if (!targetId) return false
    await playTrack(library.trackById[targetId])
    return true
  }

  function getSpectrum() {
    return engine.getFrequencyData()
  }

  watch(
    () => library.tracks.map((track) => track.id),
    (ids) => {
      if (!initialized) return
      if (queueIsLibrary.value) {
        queueIds.value = ids
      } else {
        queueIds.value = queueIds.value.filter((id) => ids.includes(id))
      }
      if (currentId.value && !ids.includes(currentId.value)) {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
        currentId.value = ''
        loadedId.value = ''
        currentTime.value = 0
        duration.value = 0
        buffered.value = 0
        isPlaying.value = false
      }
    },
  )

  watch(
    () => settings.settings.shuffle,
    (value) => {
      shuffle.value = Boolean(value)
    },
  )

  watch(
    () => settings.settings.repeatMode,
    (value) => {
      if (['off', 'all', 'one'].includes(value)) repeatMode.value = value
    },
  )

  watch(
    () => settings.settings.eq,
    (value) => {
      engine.setEqualizer(value)
    },
    { deep: true },
  )

  // If the last-played track lived in IndexedDB, it is restored once the
  // library finishes hydrating, unless the user already started something else.
  watch(
    () => library.initialized,
    (ready) => {
      if (!ready || !pendingRestore) return
      const pending = pendingRestore
      pendingRestore = null
      if (userStartedPlayback) return
      const track = library.trackById[pending.trackId]
      if (!track) return
      currentId.value = track.id
      loadedId.value = track.id
      duration.value = formatTrackDuration(track)
      pendingSeek = Number.isFinite(pending.time) ? Math.max(0, pending.time) : 0
      currentTime.value = pendingSeek
      engine.load(playableSrc(track))
      updateMetadata(track)
    },
  )

  function onPageHide() {
    persistPosition(true)
  }

  window.addEventListener('pagehide', onPageHide)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persistPosition(true)
  })

  return {
    currentId,
    currentTrack,
    queue,
    queueIds,
    currentIndex,
    isPlaying,
    buffering,
    currentTime,
    duration,
    playableDuration,
    progress,
    buffered,
    volume,
    muted,
    isMuted,
    shuffle,
    repeatMode,
    repeatLabel,
    error,
    init,
    playTrack,
    toggle,
    pause,
    next,
    prev,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    setQueue,
    getSpectrum,
  }
})
