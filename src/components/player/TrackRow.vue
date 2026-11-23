<script setup>
import { computed } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import CoverArt from '@/components/common/CoverArt.vue'
import EqualizerIcon from '@/components/common/EqualizerIcon.vue'
import { useLibraryStore } from '@/stores/library'
import { formatTime } from '@/utils/format'

const props = defineProps({
  track: { type: Object, required: true },
  index: { type: Number, default: 0 },
  active: { type: Boolean, default: false },
  playing: { type: Boolean, default: false },
  variant: { type: String, default: 'queue' },
  removable: { type: Boolean, default: false },
})

const emit = defineEmits(['play', 'remove'])

const library = useLibraryStore()
const favorite = computed(() => library.isFavorite(props.track.id))
const displayIndex = computed(() => String(props.index + 1).padStart(2, '0'))
const duration = computed(() => formatTime(props.track.duration, { fallback: '--:--' }))

function play() {
  emit('play', props.track)
}

function toggleFavorite(event) {
  event.stopPropagation()
  library.toggleFavorite(props.track.id)
}

function remove(event) {
  event.stopPropagation()
  emit('remove', props.track)
}
</script>

<template>
  <div
    class="track-row"
    :class="[`track-row--${variant}`, { 'is-active': active, 'is-playing': active && playing }]"
    role="button"
    tabindex="0"
    :aria-current="active ? 'true' : undefined"
    :aria-label="`${track.title} - ${track.artist}`"
    @click="play"
    @keydown.enter.prevent="play"
    @keydown.space.stop.prevent="play"
  >
    <span v-if="variant === 'library'" class="track-row__index">
      <EqualizerIcon v-if="active" :playing="playing" :size="12" />
      <span v-else class="track-row__index-text">{{ displayIndex }}</span>
      <span class="track-row__hover-play"><AppIcon name="play" :size="11" filled /></span>
    </span>

    <div class="track-row__cover">
      <CoverArt :src="track.cover" :alt="track.title" :rounded="8" />
    </div>

    <div class="track-row__main">
      <p class="track-row__title" :title="track.title">{{ track.title }}</p>
      <p class="track-row__artist">
        <span>{{ track.artist }}</span>
        <span v-if="variant === 'queue' && track.album" class="track-row__album-inline"> · {{ track.album }}</span>
      </p>
    </div>

    <div v-if="variant === 'library'" class="track-row__album" :title="track.album">{{ track.album }}</div>

    <span v-if="variant === 'library'" class="track-row__format">{{ track.format }}</span>

    <div class="track-row__tail">
      <EqualizerIcon v-if="active && variant === 'queue'" :playing="playing" :size="12" />
      <span class="track-row__duration">{{ duration }}</span>
      <div v-if="variant === 'library'" class="track-row__actions">
        <button
          type="button"
          class="track-row__action"
          :class="{ 'is-favorite': favorite }"
          :aria-label="favorite ? '取消收藏' : '收藏'"
          @click="toggleFavorite"
        >
          <AppIcon name="heart" :size="14" :filled="favorite" />
        </button>
        <button
          v-if="removable"
          type="button"
          class="track-row__action track-row__action--danger"
          aria-label="从曲库移除"
          @click="remove"
        >
          <AppIcon name="trash" :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.track-row {
  position: relative;
  display: grid;
  align-items: center;
  width: 100%;
  border: 1px solid transparent;
  border-radius: 11px;
  cursor: pointer;
  text-align: left;
  transition:
    background 0.2s var(--ease),
    border-color 0.2s var(--ease),
    transform 0.2s var(--ease);
}

.track-row--queue {
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 11px;
  min-height: 56px;
  padding: 6px 10px;
}

.track-row--library {
  grid-template-columns: 30px 44px minmax(0, 1.5fr) minmax(0, 1fr) 54px auto;
  gap: 12px;
  min-height: 58px;
  padding: 6px 12px;
  border-bottom: 1px solid rgba(140, 180, 255, 0.06);
  border-radius: 9px;
}

.track-row:hover {
  border-color: rgba(140, 185, 255, 0.12);
  background: rgba(255, 255, 255, 0.035);
}

.track-row:active {
  transform: scale(0.996);
}

.track-row.is-active {
  border-color: rgba(var(--neon-rgb), 0.32);
  background:
    linear-gradient(95deg, rgba(var(--neon-rgb), 0.2), rgba(var(--neon-2-rgb), 0.06) 55%, transparent 100%),
    rgba(255, 255, 255, 0.03);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 24px rgba(var(--neon-rgb), 0.08);
}

.track-row.is-active::before {
  position: absolute;
  top: 24%;
  bottom: 24%;
  left: -1px;
  width: 2px;
  border-radius: 2px;
  background: linear-gradient(var(--neon), var(--neon-2));
  box-shadow: 0 0 10px rgba(var(--neon-rgb), 0.8);
  content: "";
}

.track-row__index {
  position: relative;
  display: grid;
  width: 24px;
  place-items: center;
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.track-row.is-active .track-row__index {
  color: var(--neon);
}

.track-row__hover-play {
  position: absolute;
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 50%;
  background: rgba(var(--neon-rgb), 0.18);
  color: var(--neon);
  opacity: 0;
  transform: scale(0.8);
  transition:
    opacity 0.18s var(--ease),
    transform 0.18s var(--ease);
}

.track-row:hover .track-row__index > *:not(.track-row__hover-play) {
  opacity: 0;
}

.track-row__index-text {
  transition: opacity 0.18s var(--ease);
}

.track-row:hover .track-row__hover-play {
  opacity: 1;
  transform: scale(1);
}

.track-row__cover {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.35);
}

.track-row--library .track-row__cover {
  width: 44px;
  height: 44px;
}

.track-row__main {
  min-width: 0;
}

.track-row__title {
  overflow: hidden;
  color: var(--text-1);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-row.is-active .track-row__title {
  color: #fff;
  text-shadow: 0 0 18px rgba(var(--neon-rgb), 0.35);
}

.track-row__artist {
  display: flex;
  overflow: hidden;
  margin-top: 2px;
  color: var(--text-3);
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-row__artist span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-row__album {
  overflow: hidden;
  color: var(--text-3);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-row__format {
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 8px;
  letter-spacing: 0.1em;
  text-align: center;
}

.track-row__tail {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  min-width: 64px;
}

.track-row__duration {
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 9.5px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}

.track-row.is-active .track-row__duration {
  color: var(--text-2);
}

.track-row__actions {
  display: flex;
  gap: 2px;
  align-items: center;
  opacity: 0;
  transition: opacity 0.18s var(--ease);
}

.track-row--library .track-row__actions {
  opacity: 0.55;
}

.track-row--library:hover .track-row__actions {
  opacity: 1;
}

.track-row:hover .track-row__actions,
.track-row:focus-visible .track-row__actions,
.track-row__action.is-favorite {
  opacity: 1;
}

.track-row__action {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: 7px;
  color: var(--text-3);
  transition:
    color 0.18s var(--ease),
    background 0.18s var(--ease);
}

.track-row__action:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-1);
}

.track-row__action.is-favorite {
  color: #ff7d95;
}

.track-row__action--danger:hover {
  background: rgba(255, 93, 122, 0.12);
  color: #ff8ea2;
}

@media (max-width: 1180px) {
  .track-row--library {
    grid-template-columns: 26px 44px minmax(0, 1.6fr) 48px auto;
  }

  .track-row__album {
    display: none;
  }
}
</style>
