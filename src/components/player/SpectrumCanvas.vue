<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { usePlayerStore } from '@/stores/player'
import { useSettingsStore } from '@/stores/settings'
import { hexToRgb } from '@/utils/color'

const player = usePlayerStore()
const settingsStore = useSettingsStore()

const canvas = ref(null)
const BAR_COUNT = 22

let context = null
let frame = 0
let width = 0
let height = 0
let levels = new Array(BAR_COUNT).fill(0.04)
let dpr = 1
let accent = hexToRgb(settingsStore.neonColor)
let secondary = hexToRgb(settingsStore.neonSecondary)
let resizeObserver = null

function resize() {
  const element = canvas.value
  if (!element) return
  const rect = element.getBoundingClientRect()
  width = Math.max(1, rect.width)
  height = Math.max(1, rect.height)
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  element.width = Math.round(width * dpr)
  element.height = Math.round(height * dpr)
  context = element.getContext('2d')
  context?.setTransform(dpr, 0, 0, dpr, 0, 0)
  start()
}

function smooth(index, target) {
  const previous = levels[index] ?? 0
  return previous + (target - previous) * (target > previous ? 0.42 : 0.12)
}

function sampleBars(data, timestamp) {
  const next = new Array(BAR_COUNT)
  if (data) {
    for (let index = 0; index < BAR_COUNT; index += 1) {
      const start = Math.floor((index / BAR_COUNT) ** 1.65 * data.length * 0.66) + 2
      const end = Math.max(start + 1, Math.floor(((index + 1) / BAR_COUNT) ** 1.65 * data.length * 0.66) + 2)
      let sum = 0
      for (let bin = start; bin < end; bin += 1) sum += data[bin] ?? 0
      const average = sum / (end - start) / 255
      next[index] = Math.min(1, average ** 0.92 * 1.15)
    }
  } else {
    for (let index = 0; index < BAR_COUNT; index += 1) {
      const wave =
        0.5 + 0.5 * Math.sin(timestamp * 0.0022 + index * 0.55) * Math.sin(timestamp * 0.0011 + index * 0.21)
      next[index] = 0.08 + wave * 0.42 * (0.4 + 0.6 * Math.sin((index / BAR_COUNT) * Math.PI))
    }
  }
  return next
}

function roundedBar(x, y, barWidth, barHeight) {
  const radius = Math.min(3, barHeight / 2, barWidth / 2)
  context.beginPath()
  context.moveTo(x, y + barHeight)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.lineTo(x + barWidth - radius, y)
  context.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
  context.lineTo(x + barWidth, y + barHeight)
  context.closePath()
  context.fill()
}

function draw(timestamp = 0) {
  if (!context) return
  context.clearRect(0, 0, width, height)

  const spectrum = player.getSpectrum()
  const targets = sampleBars(spectrum, timestamp)
  const animate = player.isPlaying && settingsStore.settings.effects

  for (let index = 0; index < BAR_COUNT; index += 1) {
    const target = animate ? Math.max(0.03, targets[index]) : 0.03
    levels[index] = smooth(index, target)
    if (!animate && levels[index] < 0.035) levels[index] = 0.035
  }

  const gap = 4
  const barWidth = Math.max(2.5, (width - gap * (BAR_COUNT - 1)) / BAR_COUNT)
  const totalWidth = barWidth * BAR_COUNT + gap * (BAR_COUNT - 1)
  const offsetX = (width - totalWidth) / 2
  const baseline = height - 2

  const gradient = context.createLinearGradient(0, height * 0.1, 0, baseline)
  gradient.addColorStop(0, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.95)`)
  gradient.addColorStop(0.5, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.92)`)
  gradient.addColorStop(1, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.16)`)

  context.shadowBlur = 12
  context.shadowColor = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.5)`
  context.fillStyle = gradient

  for (let index = 0; index < BAR_COUNT; index += 1) {
    const value = levels[index]
    const barHeight = Math.max(2, value * (height - 6))
    const x = offsetX + index * (barWidth + gap)
    roundedBar(x, baseline - barHeight, barWidth, barHeight)
  }

  context.shadowBlur = 0
  context.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.12)`
  context.fillRect(offsetX, baseline, totalWidth, 1)

  // Once paused, let the bars fall and then stop the animation loop entirely.
  const settled = !animate && levels.every((level) => level <= 0.037)
  if (settled) {
    frame = 0
    return
  }
  frame = requestAnimationFrame(draw)
}

function start() {
  if (!frame) frame = requestAnimationFrame(draw)
}

function stop() {
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

function onVisibility() {
  if (document.hidden) stop()
  else start()
}

onMounted(() => {
  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas.value)
  document.addEventListener('visibilitychange', onVisibility)
  start()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  stop()
})

watch(
  () => settingsStore.neonColor,
  (value) => {
    accent = hexToRgb(value)
  },
)

watch(
  () => settingsStore.neonSecondary,
  (value) => {
    secondary = hexToRgb(value)
  },
)

watch(
  () => player.isPlaying,
  (playing) => {
    if (playing) start()
  },
)

watch(
  () => settingsStore.settings.effects,
  () => {
    start()
  },
)
</script>

<template>
  <canvas ref="canvas" class="spectrum-canvas" aria-hidden="true" />
</template>

<style scoped>
.spectrum-canvas {
  width: 100%;
  height: 100%;
  opacity: 0.72;
  pointer-events: none;
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 82%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 82%, transparent);
}
</style>
