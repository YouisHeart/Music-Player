<script setup>
import AppIcon from '@/components/common/AppIcon.vue'
import PlaylistCover from '@/components/playlist/PlaylistCover.vue'
import { formatDurationLabel } from '@/utils/format'

defineProps({
  playlist: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

defineEmits(['open', 'play'])
</script>

<template>
  <article
    class="playlist-card"
    role="button"
    tabindex="0"
    :aria-label="`${playlist.name}，${playlist.tracks.length} 首歌曲`"
    @click="$emit('open', playlist)"
    @keydown.enter.prevent="$emit('open', playlist)"
    @keydown.space.stop.prevent="$emit('open', playlist)"
  >
    <div class="playlist-card__art">
      <PlaylistCover :tracks="playlist.tracks" :icon="playlist.icon" />
      <span class="playlist-card__index">{{ String(index + 1).padStart(2, '0') }}</span>
      <button
        type="button"
        class="playlist-card__play"
        :disabled="!playlist.tracks.length"
        :aria-label="`播放 ${playlist.name}`"
        @click.stop="$emit('play', playlist)"
      >
        <AppIcon name="play" :size="18" filled />
      </button>
    </div>

    <div class="playlist-card__body">
      <p class="eyebrow">{{ playlist.subtitle }}</p>
      <h3>{{ playlist.name }}</h3>
      <p class="playlist-card__desc">{{ playlist.description }}</p>
      <div class="playlist-card__meta">
        <span>{{ formatDurationLabel(playlist.duration) }}</span>
        <span class="playlist-card__meta-dot" />
        <span>{{ playlist.tracks.length }} 首</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.playlist-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(140, 185, 255, 0.1);
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(17, 31, 56, 0.58), rgba(5, 11, 22, 0.5));
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition:
    transform 0.28s var(--ease),
    border-color 0.28s var(--ease),
    box-shadow 0.28s var(--ease);
}

.playlist-card:hover {
  border-color: rgba(var(--neon-rgb), 0.35);
  box-shadow:
    0 24px 54px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(var(--neon-rgb), 0.12);
  transform: translateY(-4px);
}

.playlist-card:focus-visible {
  outline: 2px solid rgba(var(--neon-rgb), 0.8);
}

.playlist-card__art {
  position: relative;
  aspect-ratio: 16 / 9.2;
  margin: 8px 8px 0;
  overflow: hidden;
  border-radius: 12px;
}

.playlist-card__index {
  position: absolute;
  top: 10px;
  left: 12px;
  color: rgba(255, 255, 255, 0.62);
  font-family: var(--font-display);
  font-size: 9px;
  letter-spacing: 0.16em;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.65);
}

.playlist-card__play {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 50%;
  background: linear-gradient(145deg, var(--neon), var(--neon-2));
  box-shadow:
    0 8px 22px rgba(var(--neon-rgb), 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  color: #fff;
  opacity: 0;
  transform: translateY(8px) scale(0.9);
  transition:
    opacity 0.25s var(--ease),
    transform 0.25s var(--ease-spring);
}

.playlist-card:hover .playlist-card__play,
.playlist-card:focus-within .playlist-card__play {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.playlist-card__play:hover {
  filter: brightness(1.1);
}

.playlist-card__play:disabled {
  opacity: 0;
}

.playlist-card__body {
  padding: 13px 16px 15px;
}

.playlist-card__body .eyebrow {
  font-size: 7.5px;
  letter-spacing: 0.2em;
  color: var(--text-3);
}

.playlist-card__body h3 {
  margin-top: 4px;
  overflow: hidden;
  color: var(--text-1);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-card__desc {
  overflow: hidden;
  margin-top: 4px;
  color: var(--text-3);
  font-size: 10.5px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-card__meta {
  display: flex;
  gap: 7px;
  align-items: center;
  margin-top: 9px;
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 7.5px;
  letter-spacing: 0.08em;
}

.playlist-card__meta-dot {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: var(--text-4);
}
</style>
