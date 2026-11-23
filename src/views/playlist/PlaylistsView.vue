<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/common/AppIcon.vue'
import PlaylistCard from '@/components/playlist/PlaylistCard.vue'
import PlaylistCover from '@/components/playlist/PlaylistCover.vue'
import TrackRow from '@/components/player/TrackRow.vue'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'
import { formatDurationLabel } from '@/utils/format'

const library = useLibraryStore()
const player = usePlayerStore()
const router = useRouter()

const selectedId = ref(null)

const playlists = computed(() => {
  const all = library.tracks
  const pick = (ids) => ids.map((id) => library.trackById[id]).filter(Boolean)
  const recent = [...all].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).slice(0, 12)

  const defs = [
    {
      id: 'all',
      name: '全部音乐',
      subtitle: 'LIBRARY ARCHIVE',
      description: '曲库里的每一条信号，都在这里。',
      icon: 'disc',
      tracks: all,
    },
    {
      id: 'favorites',
      name: '我喜欢的音乐',
      subtitle: 'FAVORITE SIGNALS',
      description: '被你点亮的心动频率。',
      icon: 'heart',
      tracks: library.favoriteTracks,
    },
    {
      id: 'recent',
      name: '最近添加',
      subtitle: 'RECENT UPLOAD',
      description: '刚刚接入城市网络的新声音。',
      icon: 'clock',
      tracks: recent,
    },
    {
      id: 'midnight',
      name: '午夜驾驶',
      subtitle: 'MIDNIGHT DRIVE',
      description: '低频与霓虹一起向后移动。',
      icon: 'gauge',
      tracks: pick(['demo-neon-run', 'demo-midnight-radio', 'demo-star-drift']),
    },
    {
      id: 'rain',
      name: '雨夜电台',
      subtitle: 'RAINY RADIO',
      description: '让雨声替你说一句晚安。',
      icon: 'headphones',
      tracks: pick(['demo-rain-glow', 'demo-sakura-hour', 'demo-deep-echo']),
    },
    {
      id: 'focus',
      name: '深空专注',
      subtitle: 'DEEP FOCUS',
      description: '漂浮在没有重力的星轨里。',
      icon: 'sparkles',
      tracks: pick(['demo-deep-echo', 'demo-star-drift']),
    },
  ]

  return defs.map((item) => ({
    ...item,
    duration: item.tracks.reduce((total, track) => total + (track.duration || 0), 0),
  }))
})

const selected = computed(() => playlists.value.find((item) => item.id === selectedId.value) || null)

function open(playlist) {
  selectedId.value = playlist.id
}

function back() {
  selectedId.value = null
}

function goLibrary() {
  selectedId.value = null
  router.push('/library')
}

function playPlaylist(playlist) {
  if (!playlist?.tracks.length) return
  player.playTrack(
    playlist.tracks[0],
    playlist.tracks.map((track) => track.id),
  )
}

function playTrack(track) {
  if (!selected.value) return
  player.playTrack(
    track,
    selected.value.tracks.map((item) => item.id),
  )
}

function shufflePlay() {
  if (!selected.value?.tracks.length) return
  if (!player.shuffle) player.toggleShuffle()
  const pool = selected.value.tracks
  const pick = pool[Math.floor(Math.random() * pool.length)]
  player.playTrack(
    pick,
    pool.map((track) => track.id),
  )
}
</script>

<template>
  <div class="playlists-view">
    <Transition name="detail-swap" mode="out-in">
      <div v-if="!selected" key="grid" class="playlists-grid-view">
        <header class="page-head">
          <div>
            <p class="eyebrow">COLLECTIONS · 歌单列表</p>
            <h1>歌单列表</h1>
            <p class="page-head__sub">把声音按心情归档，随时回到某一段夜色。</p>
          </div>
          <div class="page-head__chips">
            <span class="chip">{{ playlists.length }} COLLECTIONS</span>
            <span class="chip chip--accent">{{ library.totalCount }} TRACKS</span>
          </div>
        </header>

        <div class="playlist-grid scroll-area">
          <PlaylistCard
            v-for="(playlist, index) in playlists"
            :key="playlist.id"
            :playlist="playlist"
            :index="index"
            @open="open"
            @play="playPlaylist"
          />
        </div>
      </div>

      <div v-else :key="selected.id" class="playlist-detail">
        <div class="playlist-detail__top">
          <button type="button" class="back-button" @click="back">
            <AppIcon name="chevronLeft" :size="15" />
            返回歌单
          </button>
          <span class="playlist-detail__crumb">
            COLLECTIONS <i>/</i> {{ selected.subtitle }}
          </span>
        </div>

        <header class="playlist-hero glass">
          <div class="playlist-hero__art">
            <PlaylistCover :tracks="selected.tracks" :icon="selected.icon" />
          </div>
          <div class="playlist-hero__copy">
            <p class="eyebrow">{{ selected.subtitle }}</p>
            <h1>{{ selected.name }}</h1>
            <p class="playlist-hero__desc">{{ selected.description }}</p>
            <div class="playlist-hero__meta">
              <span>{{ selected.tracks.length }} 首歌曲</span>
              <span class="dot" />
              <span>{{ formatDurationLabel(selected.duration) }}</span>
              <span class="dot" />
              <span>{{ selected.tracks.length ? '本地曲库' : '暂无内容' }}</span>
            </div>
            <div class="playlist-hero__actions">
              <button
                type="button"
                class="primary-button"
                :disabled="!selected.tracks.length"
                @click="playPlaylist(selected)"
              >
                <AppIcon name="play" :size="14" filled />
                播放全部
              </button>
              <button
                type="button"
                class="ghost-button"
                :disabled="!selected.tracks.length"
                @click="shufflePlay"
              >
                <AppIcon name="shuffle" :size="14" />
                随机播放
              </button>
            </div>
          </div>
          <div class="playlist-hero__glow" aria-hidden="true" />
        </header>

        <section class="playlist-tracks glass">
          <div class="playlist-tracks__head">
            <span>TRACKLIST</span>
            <span class="playlist-tracks__hint">点击任意歌曲开始播放</span>
          </div>
          <div v-if="selected.tracks.length" class="playlist-tracks__list scroll-area">
            <TrackRow
              v-for="(track, index) in selected.tracks"
              :key="track.id"
              :track="track"
              :index="index"
              variant="library"
              :active="track.id === player.currentId"
              :playing="player.isPlaying"
              @play="playTrack"
            />
          </div>
          <div v-else class="playlist-tracks__empty">
            <span class="playlist-tracks__icon"><AppIcon name="heart" :size="28" /></span>
            <h3>这里还没有歌曲</h3>
            <p>在本地音乐中点亮心形图标，歌曲就会出现在这里。</p>
            <button type="button" class="ghost-button" @click="goLibrary">去曲库看看</button>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.playlists-view {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.playlists-grid-view,
.playlist-detail {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  min-height: 0;
}

.page-head {
  display: flex;
  flex: none;
  gap: 20px;
  align-items: flex-end;
  justify-content: space-between;
  padding: 4px 4px 0;
}

.page-head .eyebrow {
  color: var(--text-3);
  font-size: 8px;
  letter-spacing: 0.26em;
}

.page-head h1 {
  margin-top: 4px;
  color: var(--text-1);
  font-size: clamp(22px, 2.1vw, 28px);
  font-weight: 600;
  letter-spacing: 0.05em;
  line-height: 1.2;
}

.page-head__sub {
  margin-top: 5px;
  color: var(--text-3);
  font-size: 11px;
}

.page-head__chips {
  display: flex;
  gap: 7px;
  align-items: center;
}

.playlist-grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-content: start;
  min-height: 0;
  padding: 2px 2px 12px;
}

.playlist-detail__top {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 0;
}

.back-button {
  display: flex;
  gap: 5px;
  align-items: center;
  height: 30px;
  padding: 0 10px 0 6px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text-2);
  font-size: 11px;
  transition:
    color 0.2s var(--ease),
    background 0.2s var(--ease),
    border-color 0.2s var(--ease);
}

.back-button:hover {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-1);
}

.playlist-detail__crumb {
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 8px;
  letter-spacing: 0.16em;
}

.playlist-detail__crumb i {
  margin: 0 5px;
  font-style: normal;
  opacity: 0.6;
}

.playlist-hero {
  position: relative;
  display: flex;
  flex: none;
  gap: 24px;
  align-items: center;
  padding: 22px 26px;
  overflow: hidden;
}

.playlist-hero__art {
  position: relative;
  flex: none;
  width: 152px;
  height: 152px;
  overflow: hidden;
  border-radius: 14px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}

.playlist-hero__copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.playlist-hero__copy .eyebrow {
  color: var(--text-3);
  font-size: 8px;
  letter-spacing: 0.24em;
}

.playlist-hero__copy h1 {
  margin-top: 5px;
  color: #fff;
  font-size: clamp(24px, 2.4vw, 32px);
  font-weight: 600;
  letter-spacing: 0.04em;
}

.playlist-hero__desc {
  margin-top: 6px;
  color: var(--text-2);
  font-size: 12px;
}

.playlist-hero__meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 9px;
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 8px;
  letter-spacing: 0.08em;
}

.playlist-hero__meta .dot {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: var(--text-4);
}

.playlist-hero__actions {
  display: flex;
  gap: 9px;
  margin-top: 16px;
}

.playlist-hero__actions .primary-button,
.playlist-hero__actions .ghost-button {
  height: 34px;
  font-size: 11.5px;
}

.playlist-hero__glow {
  position: absolute;
  top: -80px;
  right: -40px;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--neon-rgb), 0.22), transparent 66%);
  filter: blur(30px);
  pointer-events: none;
}

.playlist-tracks {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.playlist-tracks__head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(140, 180, 255, 0.07);
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 7.5px;
  letter-spacing: 0.16em;
}

.playlist-tracks__hint {
  color: var(--text-4);
  letter-spacing: 0.06em;
}

.playlist-tracks__list {
  flex: 1;
  min-height: 0;
  padding: 7px 9px 10px;
}

.playlist-tracks__empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
}

.playlist-tracks__icon {
  display: grid;
  width: 76px;
  height: 76px;
  margin-bottom: 8px;
  border: 1px solid rgba(var(--neon-rgb), 0.2);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--neon-rgb), 0.14), transparent 70%);
  color: var(--text-3);
  place-items: center;
}

.playlist-tracks__empty h3 {
  color: var(--text-1);
  font-size: 15px;
  font-weight: 600;
}

.playlist-tracks__empty p {
  color: var(--text-3);
  font-size: 11px;
}

.playlist-tracks__empty .ghost-button {
  height: 32px;
  margin-top: 6px;
  font-size: 11px;
}

.detail-swap-enter-active,
.detail-swap-leave-active {
  transition:
    opacity 0.25s var(--ease),
    transform 0.25s var(--ease);
}

.detail-swap-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.detail-swap-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 1320px) {
  .playlist-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .playlist-grid {
    grid-template-columns: 1fr;
  }

  .playlist-hero__art {
    width: 120px;
    height: 120px;
  }
}
</style>
