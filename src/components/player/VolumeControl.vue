<script setup>
import { computed } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import NeonSlider from '@/components/common/NeonSlider.vue'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()

const iconName = computed(() => {
  if (player.isMuted || player.volume <= 0.001) return 'mute'
  if (player.volume < 0.45) return 'volumeLow'
  return 'volume'
})

const percentFormatter = (value) => `${Math.round(value * 100)}%`

function onUpdate(value) {
  player.setVolume(value)
}
</script>

<template>
  <div class="volume-control">
    <button
      type="button"
      class="volume-control__button"
      :aria-label="player.isMuted ? '取消静音' : '静音'"
      :title="player.isMuted ? '取消静音 (M)' : '静音 (M)'"
      @click="player.toggleMute()"
    >
      <AppIcon :name="iconName" :size="18" />
    </button>
    <NeonSlider
      class="volume-control__slider"
      compact
      :model-value="player.isMuted ? 0 : player.volume"
      :min="0"
      :max="1"
      :step="0.01"
      :tooltip="true"
      :format-value="percentFormatter"
      label="音量"
      @update:model-value="onUpdate"
    />
  </div>
</template>

<style scoped>
.volume-control {
  display: flex;
  gap: 9px;
  align-items: center;
  width: 146px;
}

.volume-control__button {
  display: grid;
  flex: none;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 8px;
  color: var(--text-2);
  transition:
    color 0.2s var(--ease),
    background 0.2s var(--ease);
}

.volume-control__button:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-1);
}

.volume-control__slider {
  flex: 1;
}

@media (max-width: 1320px) {
  .volume-control {
    width: 112px;
  }
}

@media (max-width: 1120px) {
  .volume-control__slider {
    display: none;
  }

  .volume-control {
    width: auto;
  }
}
</style>
