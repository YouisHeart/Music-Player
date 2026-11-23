<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import LyricsPanel from '@/components/player/LyricsPanel.vue'
import TrackRow from '@/components/player/TrackRow.vue'
import { useAudioImport } from '@/composables/useAudioImport'
import { usePlayerStore } from '@/stores/player'
import { formatTime } from '@/utils/format'

const player = usePlayerStore()
const { importing, openPicker } = useAudioImport()

const tab = ref('queue')
const listRef = ref(null)
const queue = computed(() => player.queue)
const totalDuration = computed(() =>
  queue.value.reduce((total, track) => total + (track.duration || 0), 0),
)

function playAll() {
  if (!queue.value.length) return
  player.playTrack(queue.value[0], player.queueIds)
}

function playTrack(track) {
  player.playTrack(track)
}

async function revealActive() {
  if (tab.value !== 'queue') return
  await nextTick()
  const list = listRef.value
  if (!list) return
  const active = list.querySelector('.track-row.is-active')
  if (!active) return
  const top = active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2
  list.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
}

watch(
  () => player.currentId,
  () => revealActive(),
)

watch(tab, (value) => {
  if (value === 'queue') revealActive()
})
</script>

<template>
  <aside class="queue-panel glass" aria-label="播放列表与歌词">
    <div class="queue-panel__head">
      <div class="queue-panel__tabs" role="tablist" aria-label="队列与歌词">
        <button
          type="button"
          class="queue-tab"
          :class="{ 'is-active': tab === 'queue' }"
          role="tab"
          :aria-selected="tab === 'queue'"
          @click="tab = 'queue'"
        >
          播放列表
          <span class="queue-tab__count">{{ queue.length }}</span>
        </button>
        <button
          type="button"
          class="queue-tab"
          :class="{ 'is-active': tab === 'lyrics' }"
          role="tab"
          :aria-selected="tab === 'lyrics'"
          @click="tab = 'lyrics'"
        >
          歌词
        </button>
      </div>

      <div class="queue-panel__tools">
        <button
          type="button"
          class="icon-button"
          title="导入音乐"
          aria-label="导入音乐"
          :disabled="importing"
          @click="openPicker"
        >
          <AppIcon name="folderPlus" :size="17" />
        </button>
        <button
          type="button"
          class="icon-button"
          title="播放全部"
          aria-label="播放全部"
          :disabled="!queue.length"
          @click="playAll"
        >
          <AppIcon name="play" :size="15" filled />
        </button>
      </div>
    </div>

    <div class="queue-panel__body">
      <div v-if="tab === 'queue' && queue.length" class="queue-watermark" aria-hidden="true">QUEUE</div>
      <Transition name="panel-swap" mode="out-in">
        <div v-if="tab === 'queue'" key="queue" class="queue-panel__list-wrap">
          <div v-if="queue.length" ref="listRef" class="queue-panel__list scroll-area">
            <TrackRow
              v-for="(track, index) in queue"
              :key="track.id"
              :track="track"
              :index="index"
              variant="queue"
              :active="track.id === player.currentId"
              :playing="player.isPlaying"
              @play="playTrack"
            />
          </div>
          <div v-else class="queue-empty">
            <span class="queue-empty__icon"><AppIcon name="folder" :size="28" /></span>
            <h3>播放列表是空的</h3>
            <p>导入本地音乐，开始你的赛博夜行。</p>
            <button type="button" class="ghost-button" @click="openPicker">
              <AppIcon name="plus" :size="14" />
              导入音乐
            </button>
          </div>

          <div v-if="queue.length" class="queue-summary">
            <div class="queue-summary__visual">
              <span class="queue-summary__ring ambient-fx" />
              <AppIcon name="equalizer" :size="17" />
            </div>
            <div class="queue-summary__copy">
              <p class="eyebrow">QUEUE READY</p>
              <p class="queue-summary__meta">{{ queue.length }} 首已加入队列</p>
              <span class="queue-summary__hint">拖入音频文件可继续添加</span>
            </div>
            <button type="button" class="queue-summary__add" aria-label="导入更多音乐" @click="openPicker">
              <AppIcon name="plus" :size="15" />
            </button>
          </div>
        </div>

        <LyricsPanel v-else key="lyrics" />
      </Transition>
    </div>

    <footer class="queue-panel__foot">
      <span>{{ queue.length }} 首歌曲</span>
      <span class="queue-panel__dot" />
      <span>{{ formatTime(totalDuration) }}</span>
      <span class="queue-panel__total">TOTAL</span>
    </footer>
  </aside>
</template>

<style scoped>
.queue-panel {
  display: flex;
  flex-direction: column;
  width: var(--queue-w);
  min-height: 0;
  overflow: hidden;
}

.queue-panel__head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 12px 0 18px;
  border-bottom: 1px solid rgba(140, 180, 255, 0.08);
}

.queue-panel__tabs {
  display: flex;
  gap: 18px;
  align-self: stretch;
}

.queue-tab {
  position: relative;
  display: flex;
  gap: 6px;
  align-items: center;
  color: var(--text-3);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: color 0.2s var(--ease);
}

.queue-tab:hover {
  color: var(--text-2);
}

.queue-tab.is-active {
  color: var(--text-1);
}

.queue-tab::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--neon), var(--neon-2));
  box-shadow: 0 0 12px rgba(var(--neon-rgb), 0.6);
  content: "";
  opacity: 0;
  transform: scaleX(0.5);
  transition:
    opacity 0.22s var(--ease),
    transform 0.22s var(--ease);
}

.queue-tab.is-active::after {
  opacity: 1;
  transform: scaleX(1);
}

.queue-tab__count {
  display: grid;
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  place-items: center;
  border: 1px solid rgba(var(--neon-rgb), 0.22);
  border-radius: 99px;
  background: rgba(var(--neon-rgb), 0.1);
  color: var(--neon);
  font-family: var(--font-display);
  font-size: 8px;
}

.queue-panel__tools {
  display: flex;
  gap: 2px;
  align-items: center;
}

.queue-panel__tools .icon-button {
  width: 32px;
  height: 32px;
}

.queue-panel__body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.queue-watermark {
  position: absolute;
  right: 12px;
  bottom: 104px;
  z-index: 0;
  color: transparent;
  font-family: var(--font-display);
  font-size: 72px;
  font-weight: 700;
  letter-spacing: 0.1em;
  line-height: 1;
  opacity: 0.8;
  pointer-events: none;
  user-select: none;
  -webkit-text-stroke: 1px rgba(var(--neon-rgb), 0.1);
}

.queue-panel__list-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.queue-panel__list {
  flex: 1;
  min-height: 0;
  padding: 9px 9px 4px;
}

.queue-summary {
  display: flex;
  flex: none;
  gap: 11px;
  align-items: center;
  margin: 0 10px 10px;
  padding: 10px 11px;
  border: 1px solid rgba(140, 185, 255, 0.1);
  border-radius: 12px;
  background: linear-gradient(120deg, rgba(var(--neon-rgb), 0.08), rgba(255, 255, 255, 0.018));
}

.queue-summary__visual {
  position: relative;
  display: grid;
  flex: none;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(var(--neon-rgb), 0.25);
  border-radius: 9px;
  background: rgba(var(--neon-rgb), 0.1);
  color: var(--neon);
  place-items: center;
}

.queue-summary__ring {
  position: absolute;
  inset: -4px;
  border: 1px solid rgba(var(--neon-rgb), 0.12);
  border-radius: 12px;
  animation: pulse-soft 4s ease-in-out infinite;
}

.queue-summary__copy {
  flex: 1;
  min-width: 0;
}

.queue-summary__copy .eyebrow {
  font-size: 7px;
  letter-spacing: 0.18em;
}

.queue-summary__meta {
  margin-top: 1px;
  color: var(--text-1);
  font-family: var(--font-display);
  font-size: 8.5px;
  letter-spacing: 0.06em;
}

.queue-summary__hint {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  color: var(--text-4);
  font-size: 8.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.queue-summary__add {
  display: grid;
  flex: none;
  width: 27px;
  height: 27px;
  place-items: center;
  border: 1px solid rgba(var(--neon-rgb), 0.26);
  border-radius: 7px;
  background: rgba(var(--neon-rgb), 0.09);
  color: var(--neon);
  transition:
    background 0.2s var(--ease),
    border-color 0.2s var(--ease);
}

.queue-summary__add:hover {
  border-color: rgba(var(--neon-rgb), 0.5);
  background: rgba(var(--neon-rgb), 0.18);
}

.queue-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 28px;
  text-align: center;
}

.queue-empty__icon {
  display: grid;
  width: 76px;
  height: 76px;
  margin-bottom: 8px;
  border: 1px solid rgba(var(--neon-rgb), 0.18);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, rgba(var(--neon-rgb), 0.16), transparent 70%);
  color: var(--text-3);
  place-items: center;
}

.queue-empty h3 {
  color: var(--text-1);
  font-size: 14px;
  font-weight: 600;
}

.queue-empty p {
  color: var(--text-3);
  font-size: 11px;
  line-height: 1.6;
}

.queue-empty .ghost-button {
  height: 32px;
  margin-top: 8px;
  font-size: 11px;
}

.queue-panel__foot {
  display: flex;
  flex: none;
  gap: 8px;
  align-items: center;
  height: 40px;
  padding: 0 18px;
  border-top: 1px solid rgba(140, 180, 255, 0.08);
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 8.5px;
  letter-spacing: 0.08em;
}

.queue-panel__dot {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: var(--text-4);
}

.queue-panel__total {
  margin-left: auto;
  color: var(--text-4);
  letter-spacing: 0.16em;
}

.panel-swap-enter-active,
.panel-swap-leave-active {
  transition:
    opacity 0.2s var(--ease),
    transform 0.2s var(--ease);
}

.panel-swap-enter-from {
  opacity: 0;
  transform: translateX(8px);
}

.panel-swap-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
