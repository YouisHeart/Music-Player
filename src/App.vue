<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

import AboutWindow from '@/components/about/AboutWindow.vue'
import DropOverlay from '@/components/layout/DropOverlay.vue'
import MiniPlayer from '@/components/layout/MiniPlayer.vue'
import ClosedScreen from '@/components/layout/ClosedScreen.vue'
import SideNav from '@/components/layout/SideNav.vue'
import TitleBar from '@/components/layout/TitleBar.vue'
import AppBackground from '@/components/layout/AppBackground.vue'
import ToastHost from '@/components/common/ToastHost.vue'
import SettingsWindow from '@/components/settings/SettingsWindow.vue'
import { useFileDrop } from '@/composables/useFileDrop'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useTheme } from '@/composables/useTheme'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const library = useLibraryStore()
const player = usePlayerStore()

if (import.meta.env.DEV) {
  window.__cyberDebug = { library, player, settings: useSettingsStore(), ui }
}

useTheme()
useKeyboardShortcuts()
useFileDrop((files) => library.importFiles(files))

// Restore the library and the player concurrently: the demo library is always
// available immediately, and persisted tracks are merged in as soon as
// IndexedDB responds. This keeps startup instant even on a cold browser
// profile where storage initialization can be slow.
onMounted(() => {
  library.init().catch(() => {})
  player.init().catch(() => {})
})
</script>

<template>
  <div class="app-shell" :class="{ 'is-minimized': ui.minimized }">
    <AppBackground v-if="!ui.closed" />
    <TitleBar v-show="!ui.closed" />

    <div v-show="!ui.closed" class="app-body">
      <SideNav />
      <main class="app-main">
        <RouterView v-slot="{ Component }">
          <Transition name="view" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <SettingsWindow v-if="ui.settingsOpen && !ui.closed" />
    <AboutWindow v-if="ui.aboutOpen && !ui.closed" />

    <Transition name="fade">
      <DropOverlay v-if="ui.dragActive && !ui.closed" />
    </Transition>

    <ToastHost />

    <Transition name="mini">
      <MiniPlayer v-if="ui.minimized && !ui.closed" />
    </Transition>

    <ClosedScreen v-if="ui.closed" />
  </div>
</template>

<style scoped>
.app-shell.is-minimized .title-bar,
.app-shell.is-minimized .app-body {
  opacity: 0;
  pointer-events: none;
}

.title-bar,
.app-body {
  transition: opacity 0.3s var(--ease);
}

.mini-enter-active,
.mini-leave-active {
  transition:
    opacity 0.3s var(--ease),
    transform 0.3s var(--ease);
}

.mini-enter-from,
.mini-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}
</style>
