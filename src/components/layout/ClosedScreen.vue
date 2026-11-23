<script setup>
import AppIcon from '@/components/common/AppIcon.vue'
import LogoMark from '@/components/layout/LogoMark.vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <div class="closed-screen" role="dialog" aria-label="播放器已关闭">
    <div class="closed-screen__halo ambient-fx" />
    <div class="closed-screen__inner">
      <LogoMark :size="66" class="closed-screen__logo" />
      <p class="eyebrow">SESSION TERMINATED</p>
      <h1>播放器已关闭</h1>
      <p class="closed-screen__hint">播放进度已保存，重新启动即可继续。</p>
      <button type="button" class="primary-button closed-screen__action" @click="ui.restart()">
        <AppIcon name="reset" :size="15" />
        重新启动
      </button>
      <span class="closed-screen__meta">CYBER AUDIO SYSTEM · BUILD 1.0.0</span>
    </div>
  </div>
</template>

<style scoped>
.closed-screen {
  position: fixed;
  z-index: 300;
  inset: 0;
  display: grid;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 42%, rgba(var(--neon-rgb), 0.12), transparent 40%),
    linear-gradient(160deg, #030711, #01040a 60%, #040a16);
  place-items: center;
  animation: fade-in 0.35s var(--ease);
}

.closed-screen__halo {
  position: absolute;
  width: 520px;
  height: 520px;
  border: 1px solid rgba(var(--neon-rgb), 0.12);
  border-radius: 50%;
  box-shadow:
    0 0 120px rgba(var(--neon-rgb), 0.08),
    inset 0 0 90px rgba(var(--neon-rgb), 0.06);
  animation: pulse-soft 6s ease-in-out infinite;
}

.closed-screen__halo::before,
.closed-screen__halo::after {
  position: absolute;
  border: 1px solid rgba(var(--neon-rgb), 0.08);
  border-radius: 50%;
  content: "";
}

.closed-screen__halo::before {
  inset: 62px;
}

.closed-screen__halo::after {
  inset: 128px;
}

.closed-screen__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  text-align: center;
}

.closed-screen__logo {
  margin-bottom: 16px;
}

.closed-screen__inner h1 {
  color: var(--text-1);
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.closed-screen__hint {
  color: var(--text-2);
  font-size: 13px;
}

.closed-screen__action {
  height: 42px;
  margin-top: 18px;
  padding: 0 24px;
}

.closed-screen__meta {
  margin-top: 26px;
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 8px;
  letter-spacing: 0.24em;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}
</style>
