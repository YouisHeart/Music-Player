<script setup>
import CoverArt from '@/components/common/CoverArt.vue'

defineProps({
  cover: { type: String, default: '' },
  title: { type: String, default: '' },
  spinning: { type: Boolean, default: false },
})
</script>

<template>
  <div class="vinyl-stage">
    <div class="vinyl-stage__aura ambient-fx" />
    <div class="vinyl-stage__ring ambient-fx" />
    <div class="vinyl-stage__halo" />

    <div class="vinyl" :class="{ 'is-spinning': spinning }">
      <div class="vinyl__grooves" />
      <div class="vinyl__sheen" />
      <div class="vinyl__label">
        <CoverArt :src="cover" :alt="title || 'album cover'" :rounded="'50%'" />
        <span class="vinyl__label-shade" />
      </div>
      <span class="vinyl__hole" />
      <div class="vinyl__gloss" />
    </div>

    <div class="vinyl-stage__shadow" />
  </div>
</template>

<style scoped>
.vinyl-stage {
  position: relative;
  display: grid;
  flex: none;
  width: var(--disc-size);
  height: var(--disc-size);
  place-items: center;
  isolation: isolate;
}

.vinyl-stage__aura {
  position: absolute;
  width: 124%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(var(--neon-rgb), 0.32) 0%,
    rgba(var(--neon-2-rgb), 0.16) 42%,
    transparent 70%
  );
  filter: blur(36px);
  opacity: 0.85;
  pointer-events: none;
  animation: glow-breathe 7.5s ease-in-out infinite;
}

.vinyl-stage__ring {
  position: absolute;
  width: calc(100% + 30px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: conic-gradient(
    from 130deg,
    transparent 0deg 22deg,
    rgba(var(--neon-rgb), 0.9) 42deg,
    transparent 78deg 190deg,
    rgba(var(--neon-2-rgb), 0.82) 218deg,
    transparent 254deg 360deg
  );
  filter: blur(0.7px) drop-shadow(0 0 8px rgba(var(--neon-rgb), 0.55));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
  animation: ring-spin 18s linear infinite;
  pointer-events: none;
}

.vinyl-stage__halo {
  position: absolute;
  width: calc(100% + 18px);
  aspect-ratio: 1;
  border: 1px solid rgba(var(--neon-rgb), 0.34);
  border-radius: 50%;
  box-shadow:
    0 0 26px rgba(var(--neon-rgb), 0.3),
    inset 0 0 30px rgba(var(--neon-2-rgb), 0.14);
  opacity: 0.85;
  pointer-events: none;
}

.vinyl {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle at 50% 50%, var(--vinyl-groove) 0 0.8px, transparent 0.8px 3.6px),
    radial-gradient(circle at 50% 50%, #03050a 0 30.5%, transparent 30.8%),
    radial-gradient(circle at 50% 46%, var(--vinyl-base) 0%, #070a11 62%, var(--vinyl-edge) 100%);
  box-shadow:
    0 34px 74px rgba(0, 0, 0, 0.68),
    0 10px 24px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.065),
    0 0 44px rgba(var(--neon-rgb), 0.26),
    0 0 90px rgba(var(--neon-2-rgb), 0.16);
  animation: spin 9s linear infinite;
  animation-play-state: paused;
  will-change: transform;
}

.vinyl.is-spinning {
  animation-play-state: running;
}

.vinyl__grooves {
  position: absolute;
  inset: 3.4%;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle at 50% 50%, transparent 0 1.2px, rgba(255, 255, 255, 0.03) 1.2px 1.9px),
    repeating-radial-gradient(circle at 50% 50%, transparent 0 7px, rgba(255, 255, 255, 0.018) 7px 7.7px);
  mask: radial-gradient(circle, transparent 0 31%, #000 32% 99.3%, transparent 100%);
  -webkit-mask: radial-gradient(circle, transparent 0 31%, #000 32% 99.3%, transparent 100%);
  mix-blend-mode: screen;
  opacity: 0.85;
}

.vinyl__sheen {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 205deg at 50% 50%,
    transparent 0deg,
    var(--vinyl-sheen) 26deg,
    transparent 74deg,
    transparent 168deg,
    rgba(255, 255, 255, 0.07) 202deg,
    transparent 246deg,
    transparent 360deg
  );
  mix-blend-mode: screen;
  opacity: 0.9;
  pointer-events: none;
}

.vinyl__label {
  position: absolute;
  inset: 30.5%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.075);
  border-radius: 50%;
  background: #05080f;
  box-shadow:
    0 0 0 9px rgba(0, 0, 0, 0.32),
    0 0 0 10px rgba(255, 255, 255, 0.04),
    inset 0 0 30px rgba(0, 0, 0, 0.6),
    0 0 34px rgba(var(--neon-rgb), 0.18);
}

.vinyl__label :deep(.cover-art) {
  height: 100%;
  border-radius: 50%;
}

.vinyl__label-shade {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.2), transparent 44%),
    radial-gradient(circle at 70% 82%, rgba(var(--neon-rgb), 0.12), transparent 52%);
  mix-blend-mode: screen;
  pointer-events: none;
}

.vinyl__hole {
  position: absolute;
  z-index: 6;
  top: 50%;
  left: 50%;
  width: 3.1%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #010307;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.16),
    0 0 12px rgba(0, 0, 0, 0.9),
    inset 0 1px 2px #000;
  transform: translate(-50%, -50%);
}

.vinyl__gloss {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at 31% 20%, rgba(255, 255, 255, 0.15), transparent 34%),
    radial-gradient(ellipse at 72% 84%, rgba(var(--neon-rgb), 0.1), transparent 40%);
  pointer-events: none;
}

.vinyl-stage__shadow {
  position: absolute;
  z-index: 0;
  right: 6%;
  bottom: -3%;
  left: 6%;
  height: 9%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  filter: blur(20px);
}
</style>
