<script setup>
import { computed } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import VolumeControl from '@/components/player/VolumeControl.vue'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()

const positionLabel = computed(() => {
  const total = player.queue.length
  if (!total || player.currentIndex < 0) return '-- / --'
  return `${String(player.currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
})
</script>

<template>
  <div class="transport">
    <div class="transport__readout" aria-hidden="true">
      <span class="transport__readout-label">TRACK</span>
      <span class="transport__readout-value">{{ positionLabel }}</span>
    </div>

    <div class="transport__center">
      <button
        type="button"
        class="transport__control"
        :class="{ 'is-active': player.shuffle }"
        :aria-pressed="player.shuffle"
        title="随机播放 (S)"
        aria-label="随机播放"
        @click="player.toggleShuffle()"
      >
        <AppIcon name="shuffle" :size="18" />
        <span v-if="player.shuffle" class="transport__led" />
      </button>

      <button type="button" class="transport__control" title="上一首 (P)" aria-label="上一首" @click="player.prev()">
        <AppIcon name="prev" :size="21" filled />
      </button>

      <button
        type="button"
        class="transport__play"
        :class="{ 'is-playing': player.isPlaying }"
        :aria-label="player.isPlaying ? '暂停' : '播放'"
        :title="player.isPlaying ? '暂停 (空格)' : '播放 (空格)'"
        @click="player.toggle()"
      >
        <span class="transport__play-glow" />
        <span class="transport__play-ring" />
        <AppIcon :name="player.isPlaying ? 'pause' : 'play'" :size="25" filled />
        <span v-if="player.buffering" class="transport__buffering" />
      </button>

      <button type="button" class="transport__control" title="下一首 (N)" aria-label="下一首" @click="player.next()">
        <AppIcon name="next" :size="21" filled />
      </button>

      <button
        type="button"
        class="transport__control"
        :class="{ 'is-active': player.repeatMode !== 'off' }"
        :aria-label="player.repeatLabel"
        :title="`${player.repeatLabel} (R)`"
        @click="player.cycleRepeat()"
      >
        <AppIcon name="repeat" :size="18" />
        <span v-if="player.repeatMode === 'one'" class="transport__badge">1</span>
        <span v-else-if="player.repeatMode === 'all'" class="transport__led" />
      </button>
    </div>

    <VolumeControl class="transport__volume" />
  </div>
</template>

<style scoped>
.transport {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 68px;
  padding-top: 2px;
}

.transport__readout {
  position: absolute;
  bottom: 17px;
  left: 4px;
  display: flex;
  gap: 7px;
  align-items: baseline;
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 8px;
  letter-spacing: 0.14em;
}

.transport__readout-value {
  color: var(--text-3);
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
}

.transport__center {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.transport__control {
  position: relative;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 50%;
  color: var(--text-2);
  transition:
    color 0.2s var(--ease),
    background 0.2s var(--ease),
    border-color 0.2s var(--ease),
    transform 0.2s var(--ease);
}

.transport__control:hover {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-1);
}

.transport__control:active {
  transform: scale(0.92);
}

.transport__control.is-active {
  color: var(--neon);
  text-shadow: 0 0 12px rgba(var(--neon-rgb), 0.65);
}

.transport__led {
  position: absolute;
  bottom: 4px;
  left: 50%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--neon);
  box-shadow: 0 0 7px var(--neon);
  transform: translateX(-50%);
}

.transport__badge {
  position: absolute;
  top: 3px;
  right: 3px;
  display: grid;
  width: 12px;
  height: 12px;
  place-items: center;
  border-radius: 50%;
  background: var(--neon);
  color: #03060f;
  font-family: var(--font-display);
  font-size: 7px;
  font-weight: 700;
  box-shadow: 0 0 8px rgba(var(--neon-rgb), 0.7);
}

.transport__play {
  position: relative;
  display: grid;
  width: 62px;
  height: 62px;
  margin: 0 6px;
  place-items: center;
  border: 1px solid rgba(215, 232, 255, 0.3);
  border-radius: 50%;
  background:
    radial-gradient(ellipse at 34% 18%, rgba(255, 255, 255, 0.38), transparent 54%),
    linear-gradient(145deg, var(--neon) 0%, var(--neon-2) 100%);
  box-shadow:
    0 14px 34px rgba(var(--neon-rgb), 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.06),
    inset 0 2px 2px rgba(255, 255, 255, 0.3),
    inset 0 -8px 20px rgba(9, 4, 32, 0.35);
  color: #fff;
  transition:
    transform 0.22s var(--ease-spring),
    box-shadow 0.22s var(--ease),
    filter 0.22s var(--ease);
}

.transport__play:hover {
  transform: scale(1.045);
  box-shadow:
    0 18px 40px rgba(var(--neon-rgb), 0.5),
    0 0 40px rgba(var(--neon-2-rgb), 0.28),
    inset 0 2px 2px rgba(255, 255, 255, 0.34);
}

.transport__play:active {
  transform: scale(0.97);
}

.transport__play-glow {
  position: absolute;
  z-index: -1;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--neon-rgb), 0.45), transparent 68%);
  filter: blur(10px);
  opacity: 0.8;
}

.transport__play-ring {
  position: absolute;
  inset: -7px;
  border: 1px solid rgba(var(--neon-rgb), 0.28);
  border-radius: 50%;
  opacity: 0.8;
}

.transport__play.is-playing .transport__play-ring {
  animation: pulse-soft 2.8s ease-in-out infinite;
}

.transport__buffering {
  position: absolute;
  inset: -6px;
  border: 2px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.transport__volume {
  position: absolute;
  right: 0;
  bottom: 19px;
}

@media (max-width: 1280px) {
  .transport__readout {
    display: none;
  }
}

@media (max-width: 1180px) {
  .transport__center {
    gap: 3px;
  }

  .transport__play {
    width: 56px;
    height: 56px;
  }

  .transport__volume {
    right: -4px;
  }
}
</style>
