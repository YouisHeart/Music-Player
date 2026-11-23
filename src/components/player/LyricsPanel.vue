<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import { getLyricsFor } from '@/data/lyrics'
import { usePlayerStore } from '@/stores/player'
import { findActiveLine, parseLrc } from '@/utils/lyrics'

const player = usePlayerStore()

const scroller = ref(null)
const userScrolling = ref(false)
const lines = computed(() => parseLrc(getLyricsFor(player.currentTrack)))
const activeIndex = computed(() => findActiveLine(lines.value, player.currentTime))

let scrollTimer = null
let programmaticUntil = 0

function scrollToActive(behavior = 'smooth') {
  const element = scroller.value
  if (!element || activeIndex.value < 0) return
  const line = element.querySelector(`[data-line="${activeIndex.value}"]`)
  if (!line) return
  programmaticUntil = Date.now() + 900
  const top = line.offsetTop - element.clientHeight * 0.42 + line.offsetHeight / 2
  element.scrollTo({ top: Math.max(0, top), behavior })
}

function onScroll() {
  if (Date.now() < programmaticUntil) return
  userScrolling.value = true
  window.clearTimeout(scrollTimer)
  scrollTimer = window.setTimeout(() => {
    userScrolling.value = false
  }, 4000)
}

function follow() {
  userScrolling.value = false
  scrollToActive()
}

watch(activeIndex, async (index) => {
  if (index < 0 || userScrolling.value) return
  await nextTick()
  scrollToActive()
})

watch(
  () => player.currentTrack?.id,
  async () => {
    userScrolling.value = false
    await nextTick()
    if (scroller.value) scroller.value.scrollTop = 0
    window.setTimeout(() => scrollToActive('auto'), 120)
  },
)

onBeforeUnmount(() => window.clearTimeout(scrollTimer))
</script>

<template>
  <div class="lyrics-panel">
    <template v-if="lines.length">
      <div class="lyrics-panel__head">
        <span class="eyebrow">LYRICS · 歌词</span>
        <p class="lyrics-panel__track">
          {{ player.currentTrack?.title }}
          <i>·</i>
          {{ player.currentTrack?.artist }}
        </p>
      </div>

      <div ref="scroller" class="lyrics-panel__scroll scroll-area" @scroll.passive="onScroll">
        <div class="lyrics-panel__pad" />
        <p
          v-for="(line, index) in lines"
          :key="`${line.time}-${index}`"
          :data-line="index"
          class="lyric-line"
          :class="{
            'is-active': index === activeIndex,
            'is-passed': index < activeIndex,
            'is-next': index === activeIndex + 1,
          }"
        >
          {{ line.text }}
        </p>
        <div class="lyrics-panel__pad lyrics-panel__pad--end" />
      </div>

      <Transition name="fade">
        <button v-if="userScrolling" type="button" class="lyrics-follow" @click="follow">
          <AppIcon name="lyrics" :size="13" />
          跟随歌词
        </button>
      </Transition>
    </template>

    <div v-else class="lyrics-empty">
      <div class="lyrics-empty__orb">
        <span class="lyrics-empty__ring ambient-fx" />
        <span class="lyrics-empty__ring lyrics-empty__ring--two ambient-fx" />
        <AppIcon name="lyrics" :size="30" :stroke-width="1.4" />
      </div>
      <h3>暂无歌词</h3>
      <p>{{ player.currentTrack ? `${player.currentTrack.title} · ${player.currentTrack.artist}` : '选择一首歌曲' }}</p>
      <span class="lyrics-empty__hint">享受此刻的旋律</span>
    </div>
  </div>
</template>

<style scoped>
.lyrics-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.lyrics-panel__head {
  flex: none;
  padding: 14px 16px 12px;
  border-bottom: 1px solid rgba(140, 180, 255, 0.07);
  text-align: center;
}

.lyrics-panel__head .eyebrow {
  font-size: 8px;
  letter-spacing: 0.2em;
}

.lyrics-panel__track {
  margin-top: 5px;
  overflow: hidden;
  color: var(--text-2);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lyrics-panel__track i {
  margin: 0 5px;
  color: var(--text-4);
  font-style: normal;
}

.lyrics-panel__scroll {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 0 18px;
  mask-image: linear-gradient(180deg, transparent 0, #000 7%, #000 88%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 7%, #000 88%, transparent 100%);
  scroll-behavior: smooth;
}

.lyrics-panel__pad {
  height: 34%;
}

.lyrics-panel__pad--end {
  height: 58%;
}

.lyric-line {
  padding: 7px 4px;
  color: var(--text-3);
  font-size: 12.5px;
  line-height: 1.65;
  text-align: center;
  letter-spacing: 0.03em;
  transition:
    color 0.45s var(--ease),
    font-size 0.45s var(--ease),
    opacity 0.45s var(--ease),
    transform 0.45s var(--ease);
}

.lyric-line.is-passed {
  color: var(--text-4);
  opacity: 0.5;
}

.lyric-line.is-next {
  color: var(--text-2);
}

.lyric-line.is-active {
  background: linear-gradient(100deg, #ffffff, var(--neon) 42%, var(--neon-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 17px;
  font-weight: 600;
  text-shadow: 0 0 34px rgba(var(--neon-rgb), 0.35);
  transform: scale(1.03);
}

.lyrics-follow {
  position: absolute;
  right: 14px;
  bottom: 14px;
  display: flex;
  gap: 5px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(var(--neon-rgb), 0.3);
  border-radius: 99px;
  background: rgba(5, 11, 22, 0.85);
  color: var(--neon);
  font-size: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}

.lyrics-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 7px;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.lyrics-empty__orb {
  position: relative;
  display: grid;
  width: 96px;
  height: 96px;
  margin-bottom: 14px;
  border: 1px solid rgba(var(--neon-rgb), 0.22);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, rgba(var(--neon-rgb), 0.22), rgba(5, 11, 22, 0.4) 66%);
  box-shadow:
    0 0 50px rgba(var(--neon-rgb), 0.14),
    inset 0 0 30px rgba(var(--neon-rgb), 0.08);
  color: var(--neon);
  place-items: center;
}

.lyrics-empty__ring {
  position: absolute;
  inset: -12px;
  border: 1px solid rgba(var(--neon-rgb), 0.12);
  border-radius: 50%;
  animation: pulse-soft 4.5s ease-in-out infinite;
}

.lyrics-empty__ring--two {
  inset: -26px;
  animation-delay: 1.4s;
  opacity: 0.6;
}

.lyrics-empty h3 {
  color: var(--text-1);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.lyrics-empty p {
  color: var(--text-3);
  font-size: 11px;
}

.lyrics-empty__hint {
  margin-top: 6px;
  color: var(--text-4);
  font-size: 10px;
  letter-spacing: 0.08em;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s var(--ease);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
