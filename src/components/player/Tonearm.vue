<script setup>
import { useId } from 'vue'

defineProps({
  playing: { type: Boolean, default: false },
})

const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const armGradient = `arm-${uid}`
const pivotGradient = `pivot-${uid}`
const weightGradient = `weight-${uid}`
const headGradient = `head-${uid}`
const glowFilter = `arm-glow-${uid}`
</script>

<template>
  <div class="tonearm" :class="{ 'is-playing': playing }" aria-hidden="true">
    <svg viewBox="0 0 170 360" fill="none">
      <defs>
        <linearGradient :id="armGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#384456" />
          <stop offset="0.22" stop-color="#aebdd2" />
          <stop offset="0.42" stop-color="#f6faff" />
          <stop offset="0.62" stop-color="#93a3ba" />
          <stop offset="0.82" stop-color="#d4e0f0" />
          <stop offset="1" stop-color="#2b3444" />
        </linearGradient>
        <radialGradient :id="pivotGradient" cx="0.34" cy="0.28" r="0.85">
          <stop offset="0" stop-color="#f4f9ff" />
          <stop offset="0.4" stop-color="#9aabc2" />
          <stop offset="0.75" stop-color="#4b5a70" />
          <stop offset="1" stop-color="#1a2130" />
        </radialGradient>
        <linearGradient :id="weightGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#5f6c80" />
          <stop offset="0.45" stop-color="#1c2432" />
          <stop offset="1" stop-color="#080c14" />
        </linearGradient>
        <linearGradient :id="headGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#dde8f8" />
          <stop offset="0.45" stop-color="#8d9db4" />
          <stop offset="1" stop-color="#39455a" />
        </linearGradient>
        <filter :id="glowFilter" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- arm shadow -->
      <path
        d="M114 88 C105 166 88 232 64 288"
        stroke="rgba(0,0,0,0.5)"
        stroke-width="12"
        stroke-linecap="round"
        transform="translate(4 8)"
      />

      <!-- counterweight -->
      <path d="M113 64 L129 28" stroke="#141a26" stroke-width="13" stroke-linecap="round" />
      <path d="M113 64 L129 28" :stroke="`url(#${weightGradient})`" stroke-width="10" stroke-linecap="round" />
      <circle cx="130" cy="25" r="11" :fill="`url(#${weightGradient})`" stroke="#8a99b0" stroke-opacity="0.4" />
      <circle cx="130" cy="25" r="4.5" fill="#0b101a" stroke="#63718a" stroke-opacity="0.55" />

      <!-- main arm -->
      <path
        d="M112 84 C104 160 88 226 64 282"
        :stroke="`url(#${armGradient})`"
        stroke-width="8"
        stroke-linecap="round"
      />
      <path
        d="M109.5 88 C102 160 86.5 224 63 278"
        stroke="rgba(255,255,255,0.55)"
        stroke-width="1.7"
        stroke-linecap="round"
      />

      <!-- headshell -->
      <g transform="rotate(-19 64 284)">
        <rect x="52" y="270" width="24" height="48" rx="6" fill="#10151f" stroke="#45536a" stroke-width="1" />
        <rect x="55" y="273" width="18" height="32" rx="4" :fill="`url(#${headGradient})`" />
        <rect x="55.5" y="306" width="17" height="21" rx="3" fill="#080b12" stroke="#2e3a4d" />
        <path d="M61 327 L67 327 L64 338 Z" fill="#c4d2e6" />
        <circle cx="60" cy="280" r="1.5" fill="#20293a" />
        <circle cx="68" cy="280" r="1.5" fill="#20293a" />
        <rect x="58" y="311" width="12" height="2" rx="1" fill="var(--neon)" fill-opacity="0.8" />
      </g>

      <!-- finger lift -->
      <path d="M79 279 L92 298" stroke="#9fb0c8" stroke-width="2" stroke-linecap="round" opacity="0.8" />

      <!-- pivot base -->
      <ellipse cx="113" cy="90" rx="34" ry="12" fill="rgba(0,0,0,0.45)" />
      <circle cx="112" cy="74" r="32" fill="rgba(9,14,24,0.85)" stroke="rgba(150,190,255,0.16)" />
      <circle cx="112" cy="70" r="30" :fill="`url(#${pivotGradient})`" />
      <circle cx="112" cy="70" r="22" fill="#111826" stroke="#73839a" stroke-opacity="0.5" />
      <circle cx="112" cy="70" r="20" :fill="`url(#${pivotGradient})`" />
      <circle cx="112" cy="70" r="9" fill="#273244" />
      <circle cx="112" cy="70" r="4" fill="#0b1019" stroke="#9fb1cb" stroke-opacity="0.6" />
      <circle
        cx="112"
        cy="70"
        r="35"
        stroke="var(--neon)"
        stroke-opacity="0.4"
        stroke-width="1.2"
        :filter="`url(#${glowFilter})`"
      />

      <!-- status led -->
      <circle cx="133" cy="95" r="2.4" fill="var(--neon)" :filter="`url(#${glowFilter})`" />
    </svg>
  </div>
</template>

<style scoped>
.tonearm {
  position: absolute;
  z-index: 5;
  top: calc(50% - var(--disc-size) / 2 - 30px);
  left: calc(50% + var(--disc-size) / 2 - 86px);
  width: calc(var(--disc-size) * 0.4);
  pointer-events: none;
  transform: rotate(-7deg);
  transform-origin: 66% 20%;
  transition: transform 1.05s cubic-bezier(0.22, 0.61, 0.36, 1);
  filter: drop-shadow(0 16px 22px rgba(0, 0, 0, 0.45));
}

.tonearm.is-playing {
  transform: rotate(0.6deg);
}

.tonearm svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
</style>
