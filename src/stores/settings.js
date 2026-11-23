import { computed, reactive, watch } from 'vue'

import { defineStore } from 'pinia'

import { EQ_PRESETS, NEON_PRESETS, VINYL_SKINS, WALLPAPERS } from '@/data/presets'
import { clamp } from '@/utils/format'
import { normalizeHex, rgbTriplet, shiftHue } from '@/utils/color'
import { readJson, writeJson } from '@/utils/storage'

const STORAGE_KEY = 'settings-v1'

export const DEFAULT_SETTINGS = {
  wallpaper: { type: 'preset', id: 'neon-city' },
  backgroundBlur: 10,
  neonPreset: 'azure',
  neonCustom: '#4f8dff',
  effects: true,
  vinylSkin: 'obsidian',
  coverOverrides: {},
  defaultVolume: 0.72,
  autoplay: true,
  restoreLast: true,
  showSpectrum: true,
  eq: { enabled: false, preset: 'flat', bands: [0, 0, 0] },
  repeatMode: 'all',
  shuffle: false,
}

const WALLPAPER_IDS = new Set(WALLPAPERS.map((item) => item.id))
const NEON_IDS = new Set(NEON_PRESETS.map((item) => item.id))
const VINYL_IDS = new Set(VINYL_SKINS.map((item) => item.id))
const EQ_IDS = new Set(EQ_PRESETS.map((item) => item.id))

function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
}

export function mergeSettings(input = {}) {
  const base = cloneDefaults()
  const eq = input.eq ?? {}
  return {
    ...base,
    ...input,
    wallpaper: { ...base.wallpaper, ...(input.wallpaper ?? {}) },
    coverOverrides: { ...base.coverOverrides, ...(input.coverOverrides ?? {}) },
    eq: {
      ...base.eq,
      ...eq,
      bands: Array.isArray(eq.bands) ? eq.bands.slice(0, 3) : base.eq.bands,
    },
  }
}

export function sanitizeSettings(input = {}) {
  const merged = mergeSettings(input)
  const wallpaper = merged.wallpaper ?? {}
  const validWallpaper =
    wallpaper.type === 'preset' && WALLPAPER_IDS.has(wallpaper.id)
      ? { type: 'preset', id: wallpaper.id }
      : wallpaper.type === 'custom' && typeof wallpaper.dataUrl === 'string' && wallpaper.dataUrl.startsWith('data:image/')
        ? { type: 'custom', dataUrl: wallpaper.dataUrl }
        : { ...DEFAULT_SETTINGS.wallpaper }

  const neonPreset = NEON_IDS.has(merged.neonPreset) || merged.neonPreset === 'custom' ? merged.neonPreset : 'azure'
  const bands = Array.isArray(merged.eq.bands) ? merged.eq.bands : [0, 0, 0]
  const coverOverrides = {}
  if (merged.coverOverrides && typeof merged.coverOverrides === 'object') {
    for (const [trackId, dataUrl] of Object.entries(merged.coverOverrides)) {
      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) coverOverrides[trackId] = dataUrl
    }
  }

  return {
    wallpaper: validWallpaper,
    backgroundBlur: Math.round(clamp(Number(merged.backgroundBlur) || 0, 0, 24)),
    neonPreset,
    neonCustom: normalizeHex(merged.neonCustom),
    effects: Boolean(merged.effects),
    vinylSkin: VINYL_IDS.has(merged.vinylSkin) ? merged.vinylSkin : 'obsidian',
    coverOverrides,
    defaultVolume: clamp(Number(merged.defaultVolume) || 0, 0, 1),
    autoplay: Boolean(merged.autoplay),
    restoreLast: Boolean(merged.restoreLast),
    showSpectrum: Boolean(merged.showSpectrum),
    eq: {
      enabled: Boolean(merged.eq.enabled),
      preset: EQ_IDS.has(merged.eq.preset) || merged.eq.preset === 'custom' ? merged.eq.preset : 'flat',
      bands: [0, 1, 2].map((index) => clamp(Number(bands[index]) || 0, -12, 12)),
    },
    repeatMode: ['off', 'all', 'one'].includes(merged.repeatMode) ? merged.repeatMode : 'all',
    shuffle: Boolean(merged.shuffle),
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = reactive(sanitizeSettings(readJson(STORAGE_KEY, {})))
  let saveTimer = null

  const wallpaperPreset = computed(
    () => WALLPAPERS.find((item) => item.id === settings.wallpaper.id) ?? WALLPAPERS[0],
  )

  const wallpaperUrl = computed(() => {
    if (settings.wallpaper.type === 'custom') return settings.wallpaper.dataUrl
    return wallpaperPreset.value.src
  })

  const neonColor = computed(() => {
    if (settings.neonPreset === 'custom') return normalizeHex(settings.neonCustom)
    return NEON_PRESETS.find((item) => item.id === settings.neonPreset)?.color ?? NEON_PRESETS[0].color
  })

  const neonSecondary = computed(() =>
    shiftHue(neonColor.value, 38, { saturation: 1.08, lightness: 1.06 }),
  )

  const neonRgb = computed(() => rgbTriplet(neonColor.value))
  const neonSecondaryRgb = computed(() => rgbTriplet(neonSecondary.value))

  const vinylSkin = computed(
    () => VINYL_SKINS.find((item) => item.id === settings.vinylSkin) ?? VINYL_SKINS[0],
  )

  function scheduleSave() {
    window.clearTimeout(saveTimer)
    saveTimer = window.setTimeout(() => {
      writeJson(STORAGE_KEY, JSON.parse(JSON.stringify(settings)))
    }, 220)
  }

  watch(settings, scheduleSave, { deep: true })

  function replace(next) {
    const clean = sanitizeSettings(next)
    for (const key of Object.keys(settings)) {
      if (!(key in clean)) delete settings[key]
    }
    Object.assign(settings, clean)
    scheduleSave()
  }

  function reset() {
    replace(cloneDefaults())
  }

  function coverFor(trackId) {
    return settings.coverOverrides?.[trackId] || ''
  }

  return {
    settings,
    wallpaperPreset,
    wallpaperUrl,
    neonColor,
    neonSecondary,
    neonRgb,
    neonSecondaryRgb,
    vinylSkin,
    replace,
    reset,
    coverFor,
  }
})
