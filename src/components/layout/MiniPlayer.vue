<script setup>
import { computed } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import CoverArt from '@/components/common/CoverArt.vue'
import { usePlayerStore } from '@/stores/player'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'

const player = usePlayerStore()
const settings = useSettingsStore()
const ui = useUiStore()

const track = computed(() => player.currentTrack)
const cover = computed(() => {
  if (!track.value) return ''
  return settings.coverFor(track.value.id) || track.value.cover
})
const progress = computed(() => `${(player.progress || 0) * 100}%`)
</script>

<template>
  <div class="mini-player glass glass--strong" role="complementary" aria-label="迷你播放器">
    <button type="button" class="mini-player__cover" title="展开播放器" @click="ui.restore()">
      <CoverArt :src="cover" :alt="track?.title || 'Music Player'" :rounded="10" />
      <span class="mini-player__glow" />
    </button>

    <div class="mini-player__body">
      <p class="mini-player__title">{{ track?.title || '未在播放' }}</p>
      <p class="mini-player__artist">{{ track?.artist || '选择一首歌曲开始' }}</p>
      <div class="mini-player__track">
        <span :style="{ width: progress }" />
      </div>
    </div>

    <div class="mini-player__actions">
      <button type="button" class="icon-button" :aria-label="player.isPlaying ? '暂停' : '播放'" @click="player.toggle()">
        <AppIcon :name="player.isPlaying ? 'pause' : 'play'" :size="17" filled />
      </button>
      <button type="button" class="icon-button" aria-label="下一首" @click="player.next()">
        <AppIcon name="next" :size="17" filled />
      </button>
      <button type="button" class="icon-button" aria-label="展开播放器" @click="ui.restore()">
        <AppIcon name="maximize" :size="15" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.mini-player {
  position: fixed;
  z-index: 170;
  right: 28px;
  bottom: 26px;
  display: flex;
  gap: 13px;
  align-items: center;
  width: 392px;
  padding: 12px;
  border-radius: 16px;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.55),
    0 0 30px rgba(var(--neon-rgb), 0.14);
  animation: scale-in 0.35s var(--ease-spring);
}

.mini-player__cover {
  position: relative;
  flex: none;
  width: 60px;
  height: 60px;
  border-radius: 10px;
}

.mini-player__cover :deep(.cover-art) {
  height: 100%;
}

.mini-player__glow {
  position: absolute;
  inset: -3px;
  z-index: -1;
  border-radius: 12px;
  background: var(--gradient-neon);
  filter: blur(12px);
  opacity: 0.42;
}

.mini-player__body {
  flex: 1;
  min-width: 0;
}

.mini-player__title {
  overflow: hidden;
  color: var(--text-1);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-player__artist {
  overflow: hidden;
  margin-top: 2px;
  color: var(--text-3);
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-player__track {
  height: 2px;
  margin-top: 9px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
}

.mini-player__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--neon), var(--neon-2));
  box-shadow: 0 0 8px rgba(var(--neon-rgb), 0.6);
  transition: width 0.2s linear;
}

.mini-player__actions {
  display: flex;
  flex: none;
  gap: 2px;
  align-items: center;
}

.mini-player__actions :deep(.app-icon) {
  color: var(--text-1);
}

@media (max-width: 560px) {
  .mini-player {
    right: 12px;
    bottom: 12px;
    width: calc(100vw - 24px);
  }
}
</style>
