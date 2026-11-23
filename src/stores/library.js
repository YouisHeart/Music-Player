import { computed, reactive, ref, watch } from 'vue'

import { defineStore } from 'pinia'

import { DEMO_LYRICS } from '@/data/lyrics'
import { DEMO_TRACKS } from '@/data/tracks'
import { buildImportedTrack, isAudioFile, revokeTrackUrls, trackFromRecord } from '@/utils/audioFile'
import { deleteTrackRecord, getAllTrackRecords, putTrackRecord } from '@/utils/libraryDb'
import { readJson, writeJson } from '@/utils/storage'

import { useUiStore } from './ui'

const FAVORITES_KEY = 'favorites-v1'
const DEFAULT_FAVORITES = ['demo-neon-run', 'demo-star-drift']
const MAX_BATCH = 300

const demoLibrary = DEMO_TRACKS.map((track) => ({ ...track, lyrics: DEMO_LYRICS[track.id] ?? '' }))

export const useLibraryStore = defineStore('library', () => {
  const ui = useUiStore()

  const importedTracks = ref([])
  const favorites = ref(
    readJson(FAVORITES_KEY, DEFAULT_FAVORITES).filter((id) => typeof id === 'string'),
  )
  const initialized = ref(false)
  const initializing = ref(false)
  const importing = ref(false)
  const storageAvailable = ref(true)
  const importedBytes = ref(0)
  const importProgress = reactive({ done: 0, total: 0, fileName: '' })

  const tracks = computed(() => [...demoLibrary, ...importedTracks.value])
  const trackById = computed(() => Object.fromEntries(tracks.value.map((track) => [track.id, track])))
  const localTracks = computed(() => importedTracks.value)
  const favoriteTracks = computed(() =>
    favorites.value.map((id) => trackById.value[id]).filter(Boolean),
  )
  const favoriteSet = computed(() => new Set(favorites.value))
  const totalDuration = computed(() =>
    tracks.value.reduce((total, track) => total + (track.duration || 0), 0),
  )
  const totalCount = computed(() => tracks.value.length)
  const totalImportedSize = computed(() => importedBytes.value)

  watch(
    favorites,
    (value) => {
      writeJson(FAVORITES_KEY, value)
    },
    { deep: true },
  )

  function isFavorite(trackId) {
    return favoriteSet.value.has(trackId)
  }

  function toggleFavorite(trackId) {
    if (!trackId) return
    if (favoriteSet.value.has(trackId)) {
      favorites.value = favorites.value.filter((id) => id !== trackId)
    } else {
      favorites.value = [...favorites.value, trackId]
    }
  }

  async function init() {
    if (initialized.value || initializing.value) return
    initializing.value = true
    try {
      // IndexedDB can stay pending in restricted browser profiles. The player
      // must still boot, so wait a bounded amount of time and degrade to a
      // session-only library instead of blocking the whole UI.
      const records = await Promise.race([
        getAllTrackRecords(),
        new Promise((resolve, reject) => {
          window.setTimeout(() => reject(new Error('STORAGE_TIMEOUT')), 8000)
        }),
      ])
      const restored = []
      for (const record of records) {
        try {
          restored.push(trackFromRecord(record))
        } catch {
          /* a corrupt or partially-evicted record is skipped */
        }
      }
      importedTracks.value = restored
      importedBytes.value = records.reduce((total, record) => total + (record.fileSize || 0), 0)
    } catch (error) {
      storageAvailable.value = false
      if (error?.message === 'STORAGE_TIMEOUT') {
        ui.toast('本地存储响应超时，导入的歌曲仅在本次会话有效', 'warning', 4200)
      } else {
        ui.toast('本地存储不可用，导入的歌曲仅在本次会话有效', 'warning', 4200)
      }
    } finally {
      initialized.value = true
      initializing.value = false
    }
  }

  /**
   * Import audio files one by one so progress and playable tracks appear
   * incrementally. Files are persisted to IndexedDB and survive a reload.
   */
  async function importFiles(fileList) {
    const files = Array.from(fileList ?? [])
    if (!files.length) return []
    if (importing.value) {
      ui.toast('正在导入中，请稍候…', 'info')
      return []
    }

    const audioFiles = files.filter(isAudioFile)
    const rejectedCount = files.length - audioFiles.length
    if (!audioFiles.length) {
      ui.toast('未找到可播放的音频文件，支持 MP3 / FLAC / WAV / M4A / OGG', 'error', 4200)
      return []
    }

    const selected = audioFiles.slice(0, MAX_BATCH)
    const existingKeys = new Set(
      importedTracks.value.map((track) => `${track.fileName}:${track.fileSize}`),
    )
    const added = []
    let duplicates = 0
    let failures = 0

    importing.value = true
    importProgress.done = 0
    importProgress.total = selected.length
    importProgress.fileName = ''

    for (const [index, file] of selected.entries()) {
      importProgress.fileName = file.name
      try {
        const { track, record } = await buildImportedTrack(file, { existingNames: existingKeys })
        existingKeys.add(`${file.name}:${file.size}`)
        importedTracks.value = [...importedTracks.value, track]
        importedBytes.value += file.size
        added.push(track)
        try {
          await putTrackRecord(record)
        } catch {
          storageAvailable.value = false
        }
      } catch (error) {
        if (error?.message === 'DUPLICATE') duplicates += 1
        else failures += 1
      }
      importProgress.done = index + 1
    }

    importing.value = false
    importProgress.fileName = ''

    const notes = []
    if (added.length) notes.push(`成功导入 ${added.length} 首`)
    if (duplicates) notes.push(`跳过 ${duplicates} 首重复文件`)
    if (failures) notes.push(`${failures} 首无法读取`)
    if (rejectedCount) notes.push(`${rejectedCount} 个文件不是音频`)

    if (added.length) {
      const suffix = storageAvailable.value ? '' : '（存储不可用，仅本次会话有效）'
      ui.toast(notes.join('，') + suffix, 'success', 3600)
    } else {
      ui.toast(notes.join('，') || '没有新增歌曲', duplicates && !failures ? 'info' : 'error', 3600)
    }
    return added
  }

  async function removeTrack(trackId) {
    const target = importedTracks.value.find((track) => track.id === trackId)
    if (!target) return false
    importedTracks.value = importedTracks.value.filter((track) => track.id !== trackId)
    importedBytes.value = Math.max(0, importedBytes.value - (target.fileSize || 0))
    revokeTrackUrls(target)
    if (favoriteSet.value.has(trackId)) {
      favorites.value = favorites.value.filter((id) => id !== trackId)
    }
    try {
      await deleteTrackRecord(trackId)
    } catch {
      storageAvailable.value = false
    }
    return true
  }

  return {
    tracks,
    localTracks,
    trackById,
    favorites,
    favoriteTracks,
    totalDuration,
    totalCount,
    totalImportedSize,
    initialized,
    initializing,
    importing,
    importProgress,
    storageAvailable,
    isFavorite,
    toggleFavorite,
    init,
    importFiles,
    removeTrack,
  }
})
