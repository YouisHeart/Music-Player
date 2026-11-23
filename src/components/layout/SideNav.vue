<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppIcon from '@/components/common/AppIcon.vue'
import { useAudioImport } from '@/composables/useAudioImport'
import { useLibraryStore } from '@/stores/library'
import { useUiStore } from '@/stores/ui'
import { formatDurationLabel } from '@/utils/format'

const route = useRoute()
const library = useLibraryStore()
const ui = useUiStore()
const { importing, progress, openPicker } = useAudioImport()

const navItems = [
  { to: '/player', label: '音乐播放', icon: 'music' },
  { to: '/playlists', label: '歌单列表', icon: 'playlist' },
  { to: '/library', label: '本地音乐', icon: 'disc' },
]

const durationLabel = computed(() => formatDurationLabel(library.totalDuration))

const isActive = (item) => {
  if (item.to === '/playlists') return route.path.startsWith('/playlists')
  return route.path === item.to
}
</script>

<template>
  <aside class="side-nav glass" aria-label="侧边导航">
    <nav class="nav-list">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ 'is-active': isActive(item) }"
        :title="item.label"
        :aria-label="item.label"
      >
        <span class="nav-item__icon"><AppIcon :name="item.icon" :size="18" /></span>
        <span class="nav-item__label">{{ item.label }}</span>
      </RouterLink>

      <span class="nav-divider" />

      <button
        type="button"
        class="nav-item"
        :class="{ 'is-active': ui.settingsOpen }"
        title="个性设置"
        aria-label="个性设置"
        @click="ui.openSettings()"
      >
        <span class="nav-item__icon"><AppIcon name="settings" :size="18" /></span>
        <span class="nav-item__label">个性设置</span>
      </button>
      <button
        type="button"
        class="nav-item"
        :class="{ 'is-active': ui.aboutOpen }"
        title="关于我们"
        aria-label="关于我们"
        @click="ui.openAbout()"
      >
        <span class="nav-item__icon"><AppIcon name="info" :size="18" /></span>
        <span class="nav-item__label">关于我们</span>
      </button>
    </nav>

    <div class="side-nav__spacer" />

    <section class="library-card" aria-label="曲库概览">
      <div class="library-card__head">
        <span class="library-card__label">LOCAL LIBRARY</span>
        <span class="library-card__signal" />
      </div>
      <p class="library-card__number">
        <strong>{{ library.totalCount }}</strong>
        <span>首</span>
      </p>
      <p class="library-card__meta">{{ durationLabel }} · {{ library.localTracks.length }} 首导入</p>
      <div v-if="importing" class="library-card__progress" role="progressbar" :aria-valuenow="progress">
        <span :style="{ width: `${progress}%` }" />
      </div>
      <button
        type="button"
        class="library-card__action"
        :disabled="importing"
        title="导入本地音乐"
        aria-label="导入本地音乐"
        @click="openPicker"
      >
        <AppIcon :name="importing ? 'clock' : 'plus'" :size="14" />
        <span>{{ importing ? `导入中 ${progress}%` : '导入音乐' }}</span>
      </button>
    </section>

    <div class="side-nav__footer">
      <span class="status-dot" />
      <span class="side-nav__footer-text">SYSTEM ONLINE</span>
      <span class="side-nav__version">1.0</span>
    </div>
  </aside>
</template>

<style scoped>
.side-nav {
  display: flex;
  flex: none;
  flex-direction: column;
  width: var(--sidebar-w);
  min-height: 0;
  padding: 16px 12px 14px;
  overflow: hidden;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  position: relative;
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  height: 46px;
  padding: 0 13px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--text-2);
  font-size: 13.5px;
  text-align: left;
  transition:
    color 0.22s var(--ease),
    background 0.22s var(--ease),
    border-color 0.22s var(--ease),
    box-shadow 0.22s var(--ease);
}

.nav-item:hover {
  color: var(--text-1);
  background: rgba(255, 255, 255, 0.045);
}

.nav-item.is-active {
  border-color: rgba(190, 220, 255, 0.22);
  background: linear-gradient(100deg, rgba(var(--neon-rgb), 0.94), rgba(var(--neon-2-rgb), 0.76));
  box-shadow:
    0 10px 28px rgba(var(--neon-rgb), 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  color: #fff;
}

.nav-item__icon {
  display: grid;
  flex: none;
  width: 22px;
  place-items: center;
  color: var(--text-2);
  transition: color 0.22s var(--ease);
}

.nav-item.is-active .nav-item__icon {
  color: #fff;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.5));
}

.nav-item__label {
  flex: 1;
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.nav-divider {
  height: 1px;
  margin: 9px 10px;
  background: linear-gradient(90deg, transparent, var(--line), transparent);
}

.side-nav__spacer {
  flex: 1;
  min-height: 18px;
}

.library-card {
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(12, 22, 42, 0.44), rgba(4, 9, 18, 0.34));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.library-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.library-card__label {
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 8px;
  letter-spacing: 0.2em;
}

.library-card__signal {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--neon);
  box-shadow: 0 0 8px rgba(var(--neon-rgb), 0.9);
}

.library-card__number {
  display: flex;
  gap: 5px;
  align-items: baseline;
  margin-top: 9px;
  line-height: 1;
}

.library-card__number strong {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.library-card__number span {
  color: var(--text-3);
  font-size: 10px;
}

.library-card__meta {
  margin-top: 6px;
  color: var(--text-3);
  font-size: 10px;
  line-height: 1.5;
}

.library-card__progress {
  height: 3px;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
}

.library-card__progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--neon), var(--neon-2));
  box-shadow: 0 0 8px rgba(var(--neon-rgb), 0.6);
  transition: width 0.3s var(--ease);
}

.library-card__action {
  display: flex;
  gap: 7px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 34px;
  margin-top: 12px;
  border: 1px solid rgba(var(--neon-rgb), 0.26);
  border-radius: 9px;
  background: rgba(var(--neon-rgb), 0.1);
  color: var(--neon);
  font-size: 11.5px;
  font-weight: 500;
  transition:
    background 0.2s var(--ease),
    border-color 0.2s var(--ease),
    transform 0.2s var(--ease);
}

.library-card__action:hover:not(:disabled) {
  border-color: rgba(var(--neon-rgb), 0.45);
  background: rgba(var(--neon-rgb), 0.18);
}

.library-card__action:active:not(:disabled) {
  transform: scale(0.985);
}

.side-nav__footer {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 13px 6px 2px;
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 7.5px;
  letter-spacing: 0.16em;
}

.status-dot {
  flex: none;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 7px rgba(61, 220, 151, 0.8);
}

.side-nav__footer-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.side-nav__version {
  margin-left: auto;
  font-family: var(--font-display);
}

@media (max-width: 1180px) {
  .side-nav {
    align-items: center;
    padding: 14px 9px 12px;
  }

  .nav-list {
    width: 100%;
    align-items: center;
  }

  .nav-item {
    justify-content: center;
    width: 48px;
    height: 46px;
    padding: 0;
  }

  .nav-item__label,
  .library-card__label,
  .library-card__number,
  .library-card__meta,
  .library-card__action span,
  .side-nav__footer-text,
  .side-nav__version,
  .nav-divider {
    display: none;
  }

  .library-card {
    display: grid;
    width: 52px;
    padding: 8px;
    place-items: center;
  }

  .library-card__head {
    display: none;
  }

  .library-card__action {
    width: 34px;
    height: 34px;
    margin-top: 0;
    padding: 0;
  }

  .side-nav__footer {
    justify-content: center;
    padding: 12px 0 0;
  }
}
</style>
