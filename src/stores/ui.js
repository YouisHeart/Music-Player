import { ref } from 'vue'

import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const settingsOpen = ref(false)
  const aboutOpen = ref(false)
  const minimized = ref(false)
  const closed = ref(false)
  const dragActive = ref(false)
  const toasts = ref([])
  const toastIds = ref(0)

  function toast(message, type = 'info', duration = 2800) {
    const id = ++toastIds.value
    const entry = { id, message, type }
    toasts.value = [...toasts.value.slice(-3), entry]
    if (duration > 0) {
      window.setTimeout(() => dismissToast(id), duration)
    }
    return id
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter((item) => item.id !== id)
  }

  function openSettings() {
    aboutOpen.value = false
    settingsOpen.value = true
  }

  function closeSettings() {
    settingsOpen.value = false
  }

  function openAbout() {
    settingsOpen.value = false
    aboutOpen.value = true
  }

  function closeAbout() {
    aboutOpen.value = false
  }

  function minimize() {
    minimized.value = true
  }

  function restore() {
    minimized.value = false
  }

  function shutDown() {
    minimized.value = false
    settingsOpen.value = false
    aboutOpen.value = false
    closed.value = true
  }

  function restart() {
    closed.value = false
  }

  return {
    settingsOpen,
    aboutOpen,
    minimized,
    closed,
    dragActive,
    toasts,
    toast,
    dismissToast,
    openSettings,
    closeSettings,
    openAbout,
    closeAbout,
    minimize,
    restore,
    shutDown,
    restart,
  }
})
