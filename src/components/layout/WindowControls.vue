<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import { usePlayerStore } from '@/stores/player'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const player = usePlayerStore()
const isFullscreen = ref(false)

function syncFullscreen() {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch {
    ui.toast('当前环境不支持全屏显示', 'info', 2000)
  }
}

function closeWindow() {
  player.pause()
  ui.shutDown()
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreen)
  syncFullscreen()
})

onBeforeUnmount(() => document.removeEventListener('fullscreenchange', syncFullscreen))
</script>

<template>
  <div class="window-controls">
    <span class="window-controls__divider" aria-hidden="true" />
    <button type="button" class="window-control" title="最小化" aria-label="最小化到迷你播放器" @click="ui.minimize()">
      <AppIcon name="minimize" :size="14" />
    </button>
    <button
      type="button"
      class="window-control"
      :title="isFullscreen ? '退出全屏' : '全屏'"
      :aria-label="isFullscreen ? '退出全屏' : '进入全屏'"
      @click="toggleFullscreen"
    >
      <AppIcon :name="isFullscreen ? 'restore' : 'maximize'" :size="13" />
    </button>
    <button type="button" class="window-control window-control--close" title="关闭" aria-label="关闭播放器" @click="closeWindow">
      <AppIcon name="close" :size="14" />
    </button>
  </div>
</template>

<style scoped>
.window-controls {
  display: flex;
  flex: none;
  gap: 3px;
  align-items: center;
  -webkit-app-region: no-drag;
}

.window-controls__divider {
  width: 1px;
  height: 16px;
  margin-right: 6px;
  background: var(--line);
}

.window-control {
  display: grid;
  width: 31px;
  height: 29px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text-3);
  transition:
    color 0.2s var(--ease),
    background 0.2s var(--ease),
    border-color 0.2s var(--ease);
}

.window-control:hover {
  color: var(--text-1);
  background: rgba(255, 255, 255, 0.06);
}

.window-control--close:hover {
  border-color: rgba(255, 93, 122, 0.35);
  background: rgba(255, 93, 122, 0.16);
  color: #ff9cae;
}
</style>
