import { onBeforeUnmount, onMounted } from 'vue'

import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'
import { useUiStore } from '@/stores/ui'

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  if (TYPING_TAGS.has(target.tagName)) return true
  return target.isContentEditable
}

export function useKeyboardShortcuts() {
  const player = usePlayerStore()
  const library = useLibraryStore()
  const ui = useUiStore()

  function onKeydown(event) {
    if (event.defaultPrevented) return
    if (isTypingTarget(event.target)) {
      if (event.key === 'Escape') event.target.blur?.()
      return
    }

    if (event.key === 'Escape') {
      if (ui.settingsOpen) {
        ui.closeSettings()
        return
      }
      if (ui.aboutOpen) {
        ui.closeAbout()
        return
      }
      if (ui.minimized) {
        ui.restore()
        return
      }
      if (ui.closed) {
        ui.restart()
        return
      }
    }

    if (ui.settingsOpen || ui.aboutOpen || ui.closed) return
    if (event.metaKey || event.ctrlKey || event.altKey) return

    const interactive = event.target instanceof HTMLElement
      ? event.target.closest('button, a[href], [role="slider"], [role="switch"], [role="tab"]')
      : null
    if (interactive) {
      // Native controls already react to Space/Enter, and sliders consume the
      // arrow keys themselves. Avoid double-triggering the global shortcuts.
      if (event.code === 'Space' || event.code === 'Enter') return
      if (event.target.closest('[role="slider"]')) return
    }

    const seekStep = event.shiftKey ? 15 : 5
    switch (event.code) {
      case 'Space':
        if (event.repeat) return
        event.preventDefault()
        player.toggle()
        break
      case 'ArrowRight':
        event.preventDefault()
        player.seekTo(player.currentTime + seekStep)
        break
      case 'ArrowLeft':
        event.preventDefault()
        player.seekTo(player.currentTime - seekStep)
        break
      case 'ArrowUp':
        event.preventDefault()
        player.setVolume(player.volume + 0.05)
        break
      case 'ArrowDown':
        event.preventDefault()
        player.setVolume(player.volume - 0.05)
        break
      case 'KeyM':
        if (event.repeat) return
        player.toggleMute()
        break
      case 'KeyN':
        if (event.repeat) return
        player.next()
        break
      case 'KeyP':
        if (event.repeat) return
        player.prev()
        break
      case 'KeyS':
        if (event.repeat) return
        player.toggleShuffle()
        break
      case 'KeyR':
        if (event.repeat) return
        player.cycleRepeat()
        break
      case 'KeyL':
        if (event.repeat) return
        if (player.currentId) library.toggleFavorite(player.currentId)
        break
      default:
        break
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
