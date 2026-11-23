<script setup>
import AppIcon from '@/components/common/AppIcon.vue'
</script>

<template>
  <div class="drop-overlay" role="presentation">
    <div class="drop-overlay__frame">
      <span class="drop-overlay__icon">
        <AppIcon name="uploadCloud" :size="44" :stroke-width="1.35" />
      </span>
      <h2>释放以导入音乐</h2>
      <p>支持 MP3 / FLAC / WAV / M4A / OGG，可一次拖入多个文件</p>
      <span class="drop-overlay__hint">DROP TO ADD TO LIBRARY</span>
    </div>
  </div>
</template>

<style scoped>
.drop-overlay {
  position: fixed;
  z-index: 210;
  inset: 18px;
  display: grid;
  border-radius: 26px;
  background: rgba(3, 8, 18, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  pointer-events: none;
  place-items: center;
  animation: fade-in 0.2s var(--ease);
}

.drop-overlay__frame {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: calc(100% - 44px);
  height: calc(100% - 44px);
  border: 2px dashed rgba(var(--neon-rgb), 0.66);
  border-radius: 20px;
  box-shadow:
    inset 0 0 90px rgba(var(--neon-rgb), 0.12),
    0 0 46px rgba(var(--neon-rgb), 0.18);
  text-align: center;
}

.drop-overlay__icon {
  display: grid;
  width: 92px;
  height: 92px;
  margin-bottom: 10px;
  place-items: center;
  border: 1px solid rgba(var(--neon-rgb), 0.35);
  border-radius: 26px;
  background: radial-gradient(circle at 50% 35%, rgba(var(--neon-rgb), 0.3), rgba(5, 11, 22, 0.8));
  box-shadow:
    0 0 60px rgba(var(--neon-rgb), 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  color: #dceaff;
}

.drop-overlay__frame h2 {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.drop-overlay__frame p {
  color: var(--text-2);
  font-size: 13px;
}

.drop-overlay__hint {
  margin-top: 14px;
  color: var(--text-3);
  font-family: var(--font-display);
  font-size: 8px;
  letter-spacing: 0.28em;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}
</style>
