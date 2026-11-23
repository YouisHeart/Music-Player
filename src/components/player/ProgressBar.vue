<script setup>
import { computed, ref } from 'vue'

import NeonSlider from '@/components/common/NeonSlider.vue'
import { usePlayerStore } from '@/stores/player'
import { formatTime } from '@/utils/format'

const player = usePlayerStore()

const dragging = ref(false)
const draft = ref(0)

const total = computed(() => player.playableDuration || 0)
const shown = computed(() => (dragging.value ? draft.value : player.currentTime))
const bufferValue = computed(() => Math.min(player.buffered || 0, total.value))

function onUpdate(value) {
  dragging.value = true
  draft.value = value
}

function onChange(value) {
  dragging.value = false
  player.seekTo(value)
}
</script>

<template>
  <div class="progress-bar">
    <span class="progress-bar__time progress-bar__time--current">{{ formatTime(shown) }}</span>
    <NeonSlider
      class="progress-bar__slider"
      :model-value="shown"
      :min="0"
      :max="total || 1"
      :step="0.1"
      :buffer="bufferValue"
      :disabled="!total"
      :tooltip="true"
      :format-value="formatTime"
      label="播放进度"
      @update:model-value="onUpdate"
      @change="onChange"
    />
    <span class="progress-bar__time">{{ formatTime(total) }}</span>
  </div>
</template>

<style scoped>
.progress-bar {
  display: flex;
  flex: none;
  gap: 14px;
  align-items: center;
  width: 100%;
  padding: 0 10px;
}

.progress-bar__time {
  flex: none;
  width: 44px;
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  text-align: right;
}

.progress-bar__time--current {
  color: var(--text-1);
  text-align: left;
  text-shadow: 0 0 12px rgba(var(--neon-rgb), 0.45);
}

.progress-bar__slider {
  flex: 1;
}

@media (max-width: 1180px) {
  .progress-bar {
    gap: 10px;
    padding: 0 4px;
  }

  .progress-bar__time {
    width: 38px;
    font-size: 9px;
  }
}
</style>
