import { onBeforeUnmount, onMounted } from 'vue'

import { useUiStore } from '@/stores/ui'

/**
 * Window-level drag & drop for audio files. A depth counter keeps the overlay
 * stable while the pointer crosses child elements.
 */
export function useFileDrop(onFiles) {
  const ui = useUiStore()
  let depth = 0

  const carriesFiles = (event) => Array.from(event.dataTransfer?.types ?? []).includes('Files')

  function onDragEnter(event) {
    if (!carriesFiles(event)) return
    event.preventDefault()
    depth += 1
    ui.dragActive = true
  }

  function onDragOver(event) {
    if (!carriesFiles(event)) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  }

  function onDragLeave(event) {
    if (!carriesFiles(event)) return
    depth = Math.max(0, depth - 1)
    if (depth === 0) ui.dragActive = false
  }

  function onDrop(event) {
    event.preventDefault()
    depth = 0
    ui.dragActive = false
    const files = Array.from(event.dataTransfer?.files ?? [])
    if (files.length) onFiles(files)
  }

  function reset() {
    depth = 0
    ui.dragActive = false
  }

  onMounted(() => {
    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    window.addEventListener('dragend', reset)
    window.addEventListener('blur', reset)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('dragenter', onDragEnter)
    window.removeEventListener('dragover', onDragOver)
    window.removeEventListener('dragleave', onDragLeave)
    window.removeEventListener('drop', onDrop)
    window.removeEventListener('dragend', reset)
    window.removeEventListener('blur', reset)
  })
}
