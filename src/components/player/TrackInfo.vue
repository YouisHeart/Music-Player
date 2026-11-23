<script setup>
import { computed } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const library = useLibraryStore()

const track = computed(() => player.currentTrack)
const favorite = computed(() => (track.value ? library.isFavorite(track.value.id) : false))

function toggleFavorite() {
  if (track.value) library.toggleFavorite(track.value.id)
}
</script>

<template>
  <div class="track-info">
    <Transition name="track-swap" mode="out-in">
      <div :key="track?.id || 'empty'" class="track-info__copy">
        <div class="track-info__tags">
          <span class="chip chip--accent">{{ track?.genre || 'LOCAL' }}</span>
          <span v-if="track?.bpm" class="chip">{{ track.bpm }} BPM</span>
          <span class="chip">{{ track?.format || 'AUDIO' }}</span>
        </div>
        <h2 class="track-info__title" :title="track?.title">{{ track?.title || '未在播放' }}</h2>
        <p class="track-info__artist">
          {{ track?.artist || '选择一首歌曲开始' }}
          <i>·</i>
          {{ track?.album || '本地音乐' }}
        </p>
      </div>
    </Transition>

    <button
      type="button"
      class="track-info__like"
      :class="{ 'is-active': favorite }"
      :aria-label="favorite ? '取消收藏' : '收藏当前歌曲'"
      :aria-pressed="favorite"
      :disabled="!track"
      @click="toggleFavorite"
    >
      <AppIcon name="heart" :size="18" :filled="favorite" />
    </button>
  </div>
</template>

<style scoped>
.track-info {
  position: relative;
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  padding: 2px 56px 0;
  text-align: center;
}

.track-info__copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
}

.track-info__tags {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  margin-bottom: 7px;
}

.track-info__tags .chip {
  height: 21px;
  padding: 0 7px;
  font-size: 8px;
}

.track-info__title {
  max-width: 100%;
  overflow: hidden;
  color: #fff;
  font-size: clamp(21px, 2.1vw, 27px);
  font-weight: 600;
  letter-spacing: 0.035em;
  line-height: 1.2;
  text-overflow: ellipsis;
  text-shadow: 0 0 30px rgba(var(--neon-rgb), 0.35);
  white-space: nowrap;
}

.track-info__artist {
  margin-top: 5px;
  overflow: hidden;
  max-width: 100%;
  color: var(--text-2);
  font-size: 11.5px;
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-info__artist i {
  margin: 0 5px;
  color: var(--text-4);
  font-style: normal;
}

.track-info__like {
  position: absolute;
  top: 50%;
  right: 4px;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-3);
  transform: translateY(-30%);
  transition:
    color 0.22s var(--ease),
    border-color 0.22s var(--ease),
    background 0.22s var(--ease),
    box-shadow 0.22s var(--ease);
}

.track-info__like:hover {
  border-color: rgba(var(--neon-rgb), 0.4);
  background: rgba(var(--neon-rgb), 0.1);
  color: var(--text-1);
}

.track-info__like.is-active {
  border-color: rgba(255, 93, 122, 0.5);
  background: rgba(255, 93, 122, 0.12);
  box-shadow: 0 0 20px rgba(255, 93, 122, 0.2);
  color: #ff7d95;
}

.track-swap-enter-active,
.track-swap-leave-active {
  transition:
    opacity 0.24s var(--ease),
    transform 0.24s var(--ease),
    filter 0.24s var(--ease);
}

.track-swap-enter-from {
  opacity: 0;
  filter: blur(6px);
  transform: translateY(6px);
}

.track-swap-leave-to {
  opacity: 0;
  filter: blur(4px);
  transform: translateY(-5px);
}
</style>
