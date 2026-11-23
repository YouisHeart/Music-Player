<script setup>
import { useId } from 'vue'

defineProps({
  size: { type: [Number, String], default: 36 },
})

const gradientId = `logo-grad-${useId()}`
</script>

<template>
  <svg
    class="logo-mark"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3f7bff" />
        <stop offset="0.55" stop-color="#7659ff" />
        <stop offset="1" stop-color="#b44dff" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="17" :fill="`url(#${gradientId})`" />
    <rect
      x="2.5"
      y="2.5"
      width="59"
      height="59"
      rx="16.5"
      stroke="rgba(205, 230, 255, 0.35)"
      stroke-width="1"
    />
    <path
      d="M25 43V21.5l15-3.2v20.2"
      stroke="#fff"
      stroke-width="3.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="21.5" cy="44" r="4.6" fill="#fff" />
    <circle cx="36.5" cy="39.5" r="4.6" fill="#fff" />
    <path d="M17 12h30" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.logo-mark {
  flex: none;
  filter: drop-shadow(0 0 14px rgba(var(--neon-rgb), 0.32));
}
</style>
