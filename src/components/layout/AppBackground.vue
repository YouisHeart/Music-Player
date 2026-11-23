<script setup>
import ParticleField from '@/components/layout/ParticleField.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
</script>

<template>
  <div class="app-bg" aria-hidden="true">
    <Transition name="wallpaper" appear>
      <div
        :key="settingsStore.wallpaperUrl"
        class="app-bg__image"
        :style="{ backgroundImage: `url(&quot;${settingsStore.wallpaperUrl}&quot;)` }"
      />
    </Transition>
    <div class="app-bg__veil" />
    <div class="app-bg__aurora app-bg__aurora--one ambient-fx" />
    <div class="app-bg__aurora app-bg__aurora--two ambient-fx" />
    <ParticleField />
    <div class="app-bg__grid" />
    <div class="app-bg__scanlines" />
    <div class="app-bg__noise" />
  </div>
</template>

<style scoped>
.app-bg {
  position: fixed;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 30%, rgba(var(--neon-rgb), 0.08), transparent 55%),
    #02050c;
  pointer-events: none;
}

.app-bg__image {
  position: absolute;
  inset: -6%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(var(--wall-blur)) brightness(0.82) saturate(1.24) contrast(1.03);
  transform: scale(1.03);
  will-change: filter;
}

.wallpaper-enter-active,
.wallpaper-leave-active {
  transition: opacity 0.9s var(--ease);
}

.wallpaper-enter-from,
.wallpaper-leave-to {
  opacity: 0;
}

.app-bg__veil {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 18%, rgba(4, 10, 22, 0.02) 0%, rgba(2, 6, 14, 0.3) 58%, rgba(1, 4, 10, 0.7) 100%),
    linear-gradient(180deg, rgba(2, 6, 14, 0.3) 0%, rgba(2, 6, 14, 0.1) 32%, rgba(2, 5, 12, 0.62) 100%);
}

.app-bg__aurora {
  position: absolute;
  width: 58vw;
  height: 58vw;
  border-radius: 50%;
  filter: blur(72px);
  opacity: 0.3;
  mix-blend-mode: screen;
}

.app-bg__aurora--one {
  top: -26vw;
  left: -12vw;
  background: radial-gradient(circle, rgba(var(--neon-rgb), 0.55), transparent 64%);
  animation: aurora-drift 24s ease-in-out infinite;
}

.app-bg__aurora--two {
  right: -16vw;
  bottom: -30vw;
  background: radial-gradient(circle, rgba(var(--neon-2-rgb), 0.42), transparent 66%);
  animation: aurora-drift 30s ease-in-out infinite reverse;
}

.app-bg__grid {
  position: absolute;
  right: -10%;
  bottom: -2%;
  left: -10%;
  height: 46vh;
  background-image:
    linear-gradient(rgba(120, 180, 255, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120, 180, 255, 0.12) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, transparent, #000 62%);
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 62%);
  opacity: 0.2;
  transform: perspective(480px) rotateX(62deg);
  transform-origin: bottom center;
}

.app-bg__scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.016) 0 1px, transparent 1px 3px);
  opacity: 0.45;
}

.app-bg__noise {
  position: absolute;
  inset: 0;
  background-image: url("../../assets/noise.png");
  background-repeat: repeat;
  mix-blend-mode: overlay;
  opacity: 0.3;
}
</style>
