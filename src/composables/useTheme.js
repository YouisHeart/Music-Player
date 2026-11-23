import { watchEffect } from 'vue'

import { useSettingsStore } from '@/stores/settings'

/**
 * Push the live appearance state into CSS custom properties so every component
 * follows wallpaper / neon / vinyl changes without prop drilling.
 */
export function useTheme() {
  const settingsStore = useSettingsStore()

  watchEffect(() => {
    const root = document.documentElement
    const { settings } = settingsStore

    root.style.setProperty('--neon', settingsStore.neonColor)
    root.style.setProperty('--neon-rgb', settingsStore.neonRgb)
    root.style.setProperty('--neon-2', settingsStore.neonSecondary)
    root.style.setProperty('--neon-2-rgb', settingsStore.neonSecondaryRgb)
    root.style.setProperty('--wall-blur', `${settings.backgroundBlur}px`)
    root.dataset.effects = settings.effects ? 'on' : 'off'
    root.dataset.spectrum = settings.showSpectrum ? 'on' : 'off'

    for (const [property, value] of Object.entries(settingsStore.vinylSkin.vars)) {
      root.style.setProperty(property, value)
    }

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#03060f')
  })
}
