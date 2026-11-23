<script setup>
import { ref, onBeforeUnmount, onMounted, watch } from 'vue'

import { useSettingsStore } from '@/stores/settings'
import { hexToRgb } from '@/utils/color'

const settingsStore = useSettingsStore()
const canvas = ref(null)

let context = null
let frame = 0
let width = 0
let height = 0
let particles = []
let shooting = null
let lastShot = 0
let rgb = hexToRgb(settingsStore.neonColor)
let running = false

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

function buildParticles() {
  const count = Math.max(22, Math.min(56, Math.round((width * height) / 42_000)))
  const accent = hexToRgb(settingsStore.neonColor)
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 0.4 + Math.random() * 1.3,
    speed: 0.06 + Math.random() * 0.28,
    drift: (Math.random() - 0.5) * 0.12,
    alpha: 0.12 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    colored: Math.random() > 0.4,
    accent,
  }))
}

function resize() {
  const element = canvas.value
  if (!element) return
  const rect = element.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = rect.width
  height = rect.height
  element.width = Math.round(width * dpr)
  element.height = Math.round(height * dpr)
  context = element.getContext('2d')
  context?.setTransform(dpr, 0, 0, dpr, 0, 0)
  buildParticles()
}

function draw(timestamp = 0) {
  if (!context) return
  context.clearRect(0, 0, width, height)
  const animate = settingsStore.settings.effects && !reducedMotion

  for (const particle of particles) {
    if (animate) {
      particle.y -= particle.speed
      particle.x += particle.drift
      if (particle.y < -8) {
        particle.y = height + 8
        particle.x = Math.random() * width
      }
      if (particle.x < -8) particle.x = width + 8
      if (particle.x > width + 8) particle.x = -8
    }
    const twinkle = animate ? 0.55 + Math.sin(timestamp * 0.001 + particle.phase) * 0.45 : 0.7
    const alpha = particle.alpha * twinkle
    const color = particle.colored
      ? `${particle.accent.r}, ${particle.accent.g}, ${particle.accent.b}`
      : '215, 232, 255'
    context.beginPath()
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
    context.fillStyle = `rgba(${color}, ${alpha})`
    if (particle.colored) {
      context.shadowBlur = 8
      context.shadowColor = `rgba(${color}, ${alpha * 0.8})`
    } else {
      context.shadowBlur = 0
    }
    context.fill()
  }
  context.shadowBlur = 0

  if (animate) {
    if (!shooting && timestamp - lastShot > 11_000) {
      shooting = {
        x: width * (0.15 + Math.random() * 0.6),
        y: height * (0.08 + Math.random() * 0.3),
        vx: 2.6 + Math.random() * 1.8,
        vy: 1.2 + Math.random() * 0.9,
        life: 0,
        maxLife: 45,
      }
      lastShot = timestamp
    }
    if (shooting) {
      shooting.x += shooting.vx
      shooting.y += shooting.vy
      shooting.life += 1
      const fade = Math.max(0, 1 - shooting.life / shooting.maxLife)
      const gradient = context.createLinearGradient(
        shooting.x,
        shooting.y,
        shooting.x - shooting.vx * 18,
        shooting.y - shooting.vy * 18,
      )
      gradient.addColorStop(0, `rgba(220, 240, 255, ${0.65 * fade})`)
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`)
      context.strokeStyle = gradient
      context.lineWidth = 1.2
      context.beginPath()
      context.moveTo(shooting.x, shooting.y)
      context.lineTo(shooting.x - shooting.vx * 18, shooting.y - shooting.vy * 18)
      context.stroke()
      if (shooting.life >= shooting.maxLife) shooting = null
    }
  }

  if (animate && !document.hidden) frame = requestAnimationFrame(draw)
  else frame = 0
}

function start() {
  if (running) return
  running = true
  if (!frame) frame = requestAnimationFrame(draw)
}

function stop() {
  running = false
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

function onVisibility() {
  if (document.hidden) stop()
  else start()
}

let observer = null

onMounted(() => {
  resize()
  observer = new ResizeObserver(() => resize())
  observer.observe(canvas.value)
  start()
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  stop()
})

watch(
  () => settingsStore.neonColor,
  (value) => {
    rgb = hexToRgb(value)
    for (const particle of particles) particle.accent = rgb
  },
)

watch(
  () => settingsStore.settings.effects,
  (enabled) => {
    if (enabled) start()
    else if (context) {
      stop()
      draw(performance.now())
    }
  },
)
</script>

<template>
  <canvas ref="canvas" class="particle-field" aria-hidden="true" />
</template>

<style scoped>
.particle-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.62;
  pointer-events: none;
}
</style>
