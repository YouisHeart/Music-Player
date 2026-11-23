<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'
import TrackRow from '@/components/player/TrackRow.vue'
import { useAudioImport } from '@/composables/useAudioImport'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'
import { useUiStore } from '@/stores/ui'
import { formatBytes, formatDurationLabel } from '@/utils/format'

const library = useLibraryStore()
const player = usePlayerStore()
const ui = useUiStore()
const { importing, progress, openPicker } = useAudioImport()

const query = ref('')
const filter = ref('all')
const sort = ref('default')
const searchInput = ref(null)

const filters = [
  { id: 'all', label: '全部音乐', icon: 'music' },
  { id: 'favorites', label: '我的收藏', icon: 'heart' },
  { id: 'local', label: '本地导入', icon: 'folder' },
]

const sortOptions = [
  { id: 'default', label: '默认排序' },
  { id: 'recent', label: '最近添加' },
  { id: 'title', label: '歌曲名称' },
  { id: 'duration', label: '歌曲时长' },
]

const filteredTracks = computed(() => {
  let list = library.tracks
  if (filter.value === 'favorites') list = list.filter((track) => library.isFavorite(track.id))
  else if (filter.value === 'local') list = list.filter((track) => track.source === 'local')

  const keyword = query.value.trim().toLowerCase()
  if (keyword) {
    list = list.filter((track) =>
      [track.title, track.artist, track.album, track.genre]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    )
  }

  if (sort.value === 'recent') {
    list = [...list].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
  } else if (sort.value === 'title') {
    list = [...list].sort((a, b) => String(a.title).localeCompare(String(b.title), 'zh-Hans-CN'))
  } else if (sort.value === 'duration') {
    list = [...list].sort((a, b) => (b.duration || 0) - (a.duration || 0))
  }
  return list
})

const filteredDuration = computed(() =>
  filteredTracks.value.reduce((total, track) => total + (track.duration || 0), 0),
)

const summary = computed(() => {
  const parts = [`共 ${library.totalCount} 首`, `已导入 ${library.localTracks.length} 首`]
  if (library.totalImportedSize > 0) parts.push(`占用 ${formatBytes(library.totalImportedSize)}`)
  return parts.join(' · ')
})

const isFiltering = computed(() => Boolean(query.value.trim()) || filter.value !== 'all')

function play(track) {
  player.playTrack(track, filteredTracks.value.map((item) => item.id))
}

async function removeTrack(track) {
  const removed = await library.removeTrack(track.id)
  if (removed) ui.toast(`已从曲库移除《${track.title}》`, 'music', 2200)
}

function clearFilters() {
  query.value = ''
  filter.value = 'all'
  sort.value = 'default'
}

function focusSearch() {
  searchInput.value?.focus()
  searchInput.value?.select?.()
}

function onSearchKeydown(event) {
  if (event.key === 'Escape') {
    if (query.value) query.value = ''
    else searchInput.value?.blur()
  }
}

function onWindowKeydown(event) {
  if (event.defaultPrevented) return
  const target = event.target
  if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.isContentEditable)) return
  if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault()
    focusSearch()
  }
}

onMounted(() => window.addEventListener('keydown', onWindowKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKeydown))
</script>

<template>
  <div class="library-view">
    <header class="page-head">
      <div class="page-head__copy">
        <p class="eyebrow">LOCAL LIBRARY · 本地曲库</p>
        <h1>本地音乐</h1>
        <p class="page-head__sub">{{ summary }}</p>
      </div>

      <div class="page-head__actions">
        <div class="input-shell search-box">
          <AppIcon name="search" :size="15" />
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            placeholder="搜索歌曲、歌手或专辑"
            aria-label="搜索本地音乐"
            @keydown="onSearchKeydown"
          />
          <button v-if="query" type="button" class="search-box__clear" aria-label="清空搜索" @click="query = ''">
            <AppIcon name="close" :size="12" />
          </button>
          <kbd v-else class="search-box__kbd">/</kbd>
        </div>
        <button type="button" class="primary-button" :disabled="importing" @click="openPicker">
          <AppIcon name="uploadCloud" :size="15" />
          {{ importing ? `导入中 ${progress}%` : '导入音乐' }}
        </button>
      </div>
    </header>

    <section class="library-panel glass">
      <div class="library-toolbar">
        <div class="library-toolbar__filters" role="tablist" aria-label="曲库筛选">
          <button
            v-for="item in filters"
            :key="item.id"
            type="button"
            class="filter-tab"
            :class="{ 'is-active': filter === item.id }"
            role="tab"
            :aria-selected="filter === item.id"
            @click="filter = item.id"
          >
            <AppIcon :name="item.icon" :size="14" />
            {{ item.label }}
            <span v-if="item.id === 'favorites'" class="filter-tab__count">{{ library.favoriteTracks.length }}</span>
          </button>
        </div>

        <div class="library-toolbar__right">
          <span class="library-toolbar__summary">
            {{ filteredTracks.length }} 首 · {{ formatDurationLabel(filteredDuration) }}
          </span>
          <label class="sort-control">
            <AppIcon name="equalizer" :size="13" />
            <select v-model="sort" aria-label="排序方式">
              <option v-for="option in sortOptions" :key="option.id" :value="option.id">{{ option.label }}</option>
            </select>
            <AppIcon name="chevronDown" :size="11" />
          </label>
        </div>

        <div v-if="importing" class="library-progress">
          <span :style="{ width: `${progress}%` }" />
        </div>
      </div>

      <div class="library-columns" aria-hidden="true">
        <span />
        <span />
        <span>曲目</span>
        <span>专辑</span>
        <span>格式</span>
        <span class="library-columns__end">时长</span>
      </div>

      <div class="library-panel__body scroll-area">
        <div v-if="filteredTracks.length" class="library-list">
          <TrackRow
            v-for="(track, index) in filteredTracks"
            :key="track.id"
            :track="track"
            :index="index"
            variant="library"
            :active="track.id === player.currentId"
            :playing="player.isPlaying"
            :removable="track.source === 'local'"
            @play="play"
            @remove="removeTrack"
          />
        </div>

        <div v-else class="library-empty">
          <span class="library-empty__icon">
            <AppIcon :name="isFiltering ? 'search' : 'uploadCloud'" :size="36" :stroke-width="1.4" />
          </span>
          <h2>{{ isFiltering ? '没有找到匹配的歌曲' : '曲库还是空的' }}</h2>
          <p>
            {{ isFiltering ? '换一个关键词，或清除当前筛选条件。' : '支持 MP3 / FLAC / WAV / M4A / OGG，可拖拽文件到窗口导入。' }}
          </p>
          <div class="library-empty__actions">
            <button v-if="isFiltering" type="button" class="ghost-button" @click="clearFilters">
              <AppIcon name="reset" :size="14" />
              清除筛选
            </button>
            <button v-else type="button" class="primary-button" :disabled="importing" @click="openPicker">
              <AppIcon name="uploadCloud" :size="15" />
              选择音频文件
            </button>
          </div>
        </div>

        <div v-if="filteredTracks.length && !isFiltering" class="library-drop-hint">
          <span class="library-drop-hint__icon"><AppIcon name="uploadCloud" :size="18" /></span>
          <div class="library-drop-hint__copy">
            <strong>拖拽音频文件到窗口任意位置</strong>
            <span>MP3 · FLAC · WAV · M4A · OGG</span>
          </div>
          <span class="library-drop-hint__line" />
          <span class="eyebrow">DROP ZONE ACTIVE</span>
        </div>
      </div>

      <footer class="library-footer">
        <span class="status-dot" />
        <span>{{ library.storageAvailable ? '本地持久化存储已开启' : '当前会话临时存储' }}</span>
        <span class="library-footer__hint">
          <AppIcon name="keyboard" :size="12" />
          按 / 快速搜索
        </span>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.library-view {
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

.page-head__copy .eyebrow {
  color: var(--text-3);
  font-size: 8px;
  letter-spacing: 0.26em;
}

.page-head__copy h1 {
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
  letter-spacing: 0.03em;
}

.page-head__actions {
  display: flex;
  flex: none;
  gap: 10px;
  align-items: center;
}

.search-box {
  width: min(320px, 28vw);
}

.search-box__clear {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 5px;
  color: var(--text-3);
}

.search-box__clear:hover {
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-1);
}

.search-box__kbd {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 5px;
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 9px;
}

.page-head__actions .primary-button {
  height: 38px;
}

.library-panel {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.library-toolbar {
  display: flex;
  flex: none;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  height: 58px;
  padding: 0 16px 0 18px;
  border-bottom: 1px solid rgba(140, 180, 255, 0.07);
}

.library-toolbar__filters {
  display: flex;
  gap: 4px;
  align-items: center;
}

.filter-tab {
  display: flex;
  gap: 7px;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 9px;
  color: var(--text-3);
  font-size: 11.5px;
  transition:
    color 0.2s var(--ease),
    background 0.2s var(--ease),
    border-color 0.2s var(--ease);
}

.filter-tab:hover {
  color: var(--text-2);
  background: rgba(255, 255, 255, 0.035);
}

.filter-tab.is-active {
  border-color: rgba(var(--neon-rgb), 0.3);
  background: rgba(var(--neon-rgb), 0.12);
  color: var(--neon);
}

.filter-tab__count {
  display: grid;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  place-items: center;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  font-family: var(--font-display);
  font-size: 7.5px;
}

.library-toolbar__right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.library-toolbar__summary {
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 8.5px;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.sort-control {
  position: relative;
  display: flex;
  gap: 6px;
  align-items: center;
  height: 30px;
  padding: 0 9px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--text-3);
}

.sort-control:hover {
  border-color: var(--line-strong);
}

.sort-control select {
  padding-right: 4px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-2);
  font-size: 10.5px;
  appearance: none;
  cursor: pointer;
}

.sort-control select option {
  background: #08101f;
  color: var(--text-1);
}

.sort-control :deep(.app-icon:last-child) {
  pointer-events: none;
}

.library-progress {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
}

.library-progress span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--neon), var(--neon-2));
  box-shadow: 0 0 10px rgba(var(--neon-rgb), 0.7);
  transition: width 0.3s var(--ease);
}

.library-columns {
  display: grid;
  flex: none;
  grid-template-columns: 30px 44px minmax(0, 1.5fr) minmax(0, 1fr) 54px 90px;
  gap: 12px;
  align-items: center;
  height: 34px;
  padding: 0 12px;
  border-bottom: 1px solid rgba(140, 180, 255, 0.06);
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 7.5px;
  letter-spacing: 0.12em;
}

.library-columns__end {
  text-align: right;
}

.library-panel__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 6px 8px 10px;
}

.library-list {
  flex: none;
}

.library-drop-hint {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 58px;
  margin: auto 4px 2px;
  padding: 10px 14px;
  border: 1px dashed rgba(140, 185, 255, 0.16);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.018);
  color: var(--text-3);
}

.library-drop-hint__icon {
  display: grid;
  flex: none;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid rgba(var(--neon-rgb), 0.22);
  border-radius: 8px;
  background: rgba(var(--neon-rgb), 0.08);
  color: var(--neon);
}

.library-drop-hint__copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.library-drop-hint__copy strong {
  color: var(--text-2);
  font-size: 10.5px;
  font-weight: 500;
}

.library-drop-hint__copy span {
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 7.5px;
  letter-spacing: 0.08em;
}

.library-drop-hint__line {
  flex: 1;
  height: 1px;
  margin: 0 8px;
  background: linear-gradient(90deg, var(--line), transparent);
}

.library-drop-hint .eyebrow {
  flex: none;
  color: var(--text-4);
  font-size: 7.5px;
}

.library-empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  padding: 32px;
  text-align: center;
}

.library-empty__icon {
  display: grid;
  width: 92px;
  height: 92px;
  margin-bottom: 10px;
  border: 1px dashed rgba(var(--neon-rgb), 0.32);
  border-radius: 24px;
  background: radial-gradient(circle at 50% 40%, rgba(var(--neon-rgb), 0.15), transparent 70%);
  color: var(--text-2);
  place-items: center;
}

.library-empty h2 {
  color: var(--text-1);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.library-empty p {
  max-width: 380px;
  color: var(--text-3);
  font-size: 11.5px;
  line-height: 1.7;
}

.library-empty__actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.library-footer {
  display: flex;
  flex: none;
  gap: 7px;
  align-items: center;
  height: 36px;
  padding: 0 18px;
  border-top: 1px solid rgba(140, 180, 255, 0.06);
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 7.5px;
  letter-spacing: 0.1em;
}

.status-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 7px rgba(61, 220, 151, 0.8);
}

.library-footer__hint {
  display: flex;
  gap: 5px;
  align-items: center;
  margin-left: auto;
  color: var(--text-4);
  letter-spacing: 0.06em;
}

@media (max-width: 1180px) {
  .search-box {
    width: 220px;
  }

  .library-toolbar__summary {
    display: none;
  }

  .library-columns {
    grid-template-columns: 26px 44px minmax(0, 1.6fr) 48px 90px;
  }

  .library-columns span:nth-child(4) {
    display: none;
  }
}

@media (max-width: 980px) {
  .page-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-head__actions {
    width: 100%;
  }

  .search-box {
    flex: 1;
    width: auto;
  }
}
</style>
