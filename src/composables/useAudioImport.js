import { computed } from 'vue'

import { useLibraryStore } from '@/stores/library'
import { useUiStore } from '@/stores/ui'
import { pickAudioFiles } from '@/utils/filePicker'

export function useAudioImport() {
  const library = useLibraryStore()
  const ui = useUiStore()

  const importing = computed(() => library.importing)
  const progress = computed(() => {
    if (!library.importProgress.total) return 0
    return Math.round((library.importProgress.done / library.importProgress.total) * 100)
  })

  async function openPicker() {
    if (library.importing) {
      ui.toast('正在导入中，请稍候…', 'info', 1800)
      return
    }
    const files = await pickAudioFiles()
    if (files.length) await library.importFiles(files)
  }

  return { importing, progress, openPicker }
}
