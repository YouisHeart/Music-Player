<script setup>
defineProps({
  playing: { type: Boolean, default: false },
  bars: { type: Number, default: 4 },
  size: { type: Number, default: 12 },
})
</script>

<template>
  <span
    class="equalizer"
    :class="{ 'is-playing': playing }"
    :style="{ '--bars': bars, '--eq-size': `${size}px` }"
    aria-hidden="true"
  >
    <i v-for="index in bars" :key="index" :style="{ animationDelay: `${index * -0.18}s` }" />
  </span>
</template>

<style scoped>
.equalizer {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  width: var(--eq-size);
  height: var(--eq-size);
  color: var(--neon);
}

.equalizer i {
  display: block;
  width: 2px;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--neon), var(--neon-2));
  box-shadow: 0 0 6px rgba(var(--neon-rgb), 0.6);
  transform: scaleY(0.25);
  transform-origin: bottom;
  opacity: 0.45;
}

.equalizer.is-playing i {
  opacity: 1;
  animation: equalize 0.95s ease-in-out infinite;
}
</style>
