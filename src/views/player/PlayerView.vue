<script setup>
import { computed } from 'vue'

import ProgressBar from '@/components/player/ProgressBar.vue'
import QueuePanel from '@/components/player/QueuePanel.vue'
import SpectrumCanvas from '@/components/player/SpectrumCanvas.vue'
import Tonearm from '@/components/player/Tonearm.vue'
import TrackInfo from '@/components/player/TrackInfo.vue'
import TransportControls from '@/components/player/TransportControls.vue'
import VinylRecord from '@/components/player/VinylRecord.vue'
import { usePlayerStore } from '@/stores/player'
import { useSettingsStore } from '@/stores/settings'

const player = usePlayerStore()
const settings = useSettingsStore()

const track = computed(() => player.currentTrack)

const cover = computed(() => {
  if (!track.value) return ''
  return settings.coverFor(track.value.id) || track.value.cover
})

const ambientStyle = computed(() => {
  if (!cover.value) return {}
  return { backgroundImage: `url("${cover.value}")` }
})

const showSpectrum = computed(() => settings.settings.showSpectrum)
</script>

<template>
  <div class="player-view">
    <section class="stage glass" aria-label="正在播放">
      <div class="stage__ambient" :style="ambientStyle" aria-hidden="true" />
      <div class="stage__art" :style="ambientStyle" aria-hidden="true" />
      <div class="stage__ambient-veil" aria-hidden="true" />

      <header class="stage__topline">
        <span class="stage__live">
          <i />
          NOW PLAYING
        </span>
        <div class="stage__meta">
          <span class="chip">{{ track?.quality || 'HQ' }}</span>
          <span class="chip chip--accent">{{ track?.format || 'AUDIO' }}</span>
        </div>
      </header>

      <div class="stage__deck">
        <div v-if="showSpectrum" class="stage__spectrum" aria-hidden="true">
          <SpectrumCanvas />
        </div>
        <VinylRecord :cover="cover" :title="track?.title" :spinning="player.isPlaying" />
        <Tonearm :playing="player.isPlaying" />
      </div>

      <TrackInfo />
      <ProgressBar />
      <TransportControls />
    </section>

    <QueuePanel />
  </div>
</template>

<style scoped>
.player-view {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--queue-w);
  gap: 18px;
  width: 100%;
  min-height: 0;
}

.stage {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 20px 30px 22px;
  overflow: hidden;
}

.stage__ambient {
  position: absolute;
  z-index: 0;
  inset: -14%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(58px) saturate(1.65) brightness(0.82);
  opacity: 0.58;
  transform: scale(1.12);
  transition: background-image 0.6s var(--ease);
  pointer-events: none;
}

.stage__art {
  position: absolute;
  z-index: 0;
  inset: 0;
  background-position: center 58%;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(1.5px) brightness(0.68) saturate(1.2);
  opacity: 0.3;
  mask-image: radial-gradient(ellipse at 50% 44%, #000 18%, rgba(0, 0, 0, 0.6) 54%, transparent 82%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 44%, #000 18%, rgba(0, 0, 0, 0.6) 54%, transparent 82%);
  pointer-events: none;
}

.stage__ambient-veil {
  position: absolute;
  z-index: 0;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 42%, rgba(3, 7, 16, 0) 0%, rgba(3, 7, 16, 0.3) 62%, rgba(2, 5, 12, 0.74) 100%),
    linear-gradient(180deg, rgba(3, 8, 17, 0.2), rgba(3, 7, 16, 0.04) 45%, rgba(2, 5, 12, 0.5));
  pointer-events: none;
}

.stage__topline {
  position: relative;
  z-index: 3;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  min-height: 22px;
}

.stage__live {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--text-2);
  font-family: var(--font-display);
  font-size: 8.5px;
  letter-spacing: 0.24em;
}

.stage__live i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--neon);
  box-shadow: 0 0 10px rgba(var(--neon-rgb), 0.95);
  animation: pulse-dot 2.2s ease-out infinite;
}

.stage__meta {
  display: flex;
  gap: 6px;
  align-items: center;
}

.stage__meta .chip {
  height: 20px;
  padding: 0 7px;
  font-size: 7.5px;
}

.stage__deck {
  --disc-size: clamp(268px, 43vh, 410px);

  position: relative;
  z-index: 2;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 4px 0 2px;
}

.stage__spectrum {
  position: absolute;
  bottom: 2%;
  left: -2px;
  z-index: 0;
  width: 196px;
  height: 76px;
  opacity: 0.72;
  pointer-events: none;
}

.stage :deep(.track-info),
.stage :deep(.progress-bar),
.stage :deep(.transport) {
  z-index: 3;
}

.stage :deep(.progress-bar) {
  margin-top: 6px;
}

.stage :deep(.transport) {
  margin-top: 2px;
}

@media (max-width: 1320px) {
  .stage {
    padding: 18px 22px 18px;
  }

  .stage__spectrum {
    width: 140px;
    height: 60px;
  }
}

@media (max-width: 1180px) {
  .stage {
    padding: 16px 18px 16px;
  }

  .stage__spectrum {
    display: none;
  }

  .stage__deck {
    --disc-size: clamp(240px, 39vh, 360px);
  }
}

@media (max-height: 760px) {
  .stage {
    padding-top: 14px;
    padding-bottom: 12px;
  }

  .stage__deck {
    --disc-size: clamp(230px, 38vh, 330px);
  }
}
</style>
