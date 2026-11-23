<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import LogoMark from '@/components/layout/LogoMark.vue'
import WindowControls from '@/components/layout/WindowControls.vue'
import { useLibraryStore } from '@/stores/library'

const library = useLibraryStore()

const statusText = computed(() =>
  library.initializing ? 'SYNCING LIBRARY' : `${library.totalCount} TRACKS · LOCAL MODE`,
)
</script>

<template>
  <header class="title-bar">
    <RouterLink to="/player" class="brand" aria-label="Music Player 首页">
      <LogoMark :size="35" />
      <div class="brand__text">
        <span class="brand__name">Music Player</span>
        <span class="brand__sub">
          <i class="brand__dot" />
          CYBER AUDIO SYSTEM
        </span>
      </div>
    </RouterLink>

    <div class="title-bar__readout" aria-hidden="true">
      <span class="readout-dot" />
      <span>{{ statusText }}</span>
      <span class="readout-line" />
      <span class="readout-version">V1.0.0</span>
    </div>

    <WindowControls />
  </header>
</template>

<style scoped>
.title-bar {
  position: relative;
  z-index: 4;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  height: var(--titlebar-h);
  padding: 0 22px 0 28px;
  -webkit-app-region: drag;
}

.title-bar::after {
  position: absolute;
  right: 28px;
  bottom: 0;
  left: 28px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(140, 190, 255, 0.16), rgba(var(--neon-rgb), 0.2), transparent);
  content: "";
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
  -webkit-app-region: no-drag;
}

.brand__text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.brand__name {
  overflow: hidden;
  color: var(--text-1);
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand__sub {
  display: flex;
  gap: 7px;
  align-items: center;
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 8px;
  letter-spacing: 0.24em;
  line-height: 1;
}

.brand__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--neon);
  box-shadow: 0 0 8px rgba(var(--neon-rgb), 0.9);
}

.title-bar__readout {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 7px 13px;
  border: 1px solid rgba(130, 175, 255, 0.09);
  border-radius: 8px;
  background: rgba(4, 9, 18, 0.26);
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 8.5px;
  letter-spacing: 0.18em;
  -webkit-app-region: no-drag;
}

.readout-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 8px rgba(61, 220, 151, 0.9);
  animation: pulse-dot 2.6s ease-out infinite;
}

.readout-line {
  width: 24px;
  height: 1px;
  background: linear-gradient(90deg, var(--line-strong), transparent);
}

.readout-version {
  color: var(--text-4);
}

@media (max-width: 1180px) {
  .title-bar {
    padding-left: 20px;
  }

  .title-bar__readout {
    display: none;
  }
}

@media (max-width: 720px) {
  .brand__sub {
    display: none;
  }
}
</style>
