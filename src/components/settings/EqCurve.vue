<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  bands: { type: Array, default: () => [0, 0, 0] },
  enabled: { type: Boolean, default: false },
})

const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const areaId = `eq-area-${uid}`
const lineId = `eq-line-${uid}`

const WIDTH = 600
const HEIGHT = 120
const MIDDLE = HEIGHT / 2
const AMPLITUDE = 38

const points = computed(() => {
  const values = [0, 1, 2].map((index) => Number(props.bands[index]) || 0)
  return [
    { x: 12, y: MIDDLE - (values[0] / 12) * AMPLITUDE },
    { x: WIDTH * 0.34, y: MIDDLE - (values[0] / 12) * AMPLITUDE * 0.55 - (values[1] / 12) * AMPLITUDE * 0.45 },
    { x: WIDTH * 0.68, y: MIDDLE - (values[2] / 12) * AMPLITUDE * 0.5 - (values[1] / 12) * AMPLITUDE * 0.35 },
    { x: WIDTH - 12, y: MIDDLE - (values[2] / 12) * AMPLITUDE },
  ]
})

const linePath = computed(() => {
  const [a, b, c, d] = points.value
  return [
    `M ${a.x} ${a.y}`,
    `C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`,
    `S ${(b.x + c.x) / 2} ${c.y}, ${c.x} ${c.y}`,
    `S ${(c.x + d.x) / 2} ${d.y}, ${d.x} ${d.y}`,
  ].join(' ')
})

const areaPath = computed(() => `${linePath.value} L ${WIDTH - 12} ${HEIGHT} L 12 ${HEIGHT} Z`)

const gridLines = [0.25, 0.5, 0.75]
</script>

<template>
  <div class="eq-curve" :class="{ 'is-disabled': !enabled }">
    <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient :id="areaId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--neon)" stop-opacity="0.42" />
          <stop offset="0.65" stop-color="var(--neon-2)" stop-opacity="0.12" />
          <stop offset="1" stop-color="var(--neon-2)" stop-opacity="0" />
        </linearGradient>
        <linearGradient :id="lineId" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="var(--neon)" />
          <stop offset="1" stop-color="var(--neon-2)" />
        </linearGradient>
      </defs>

      <line
        v-for="ratio in gridLines"
        :key="ratio"
        x1="0"
        :y1="HEIGHT * ratio"
        :x2="WIDTH"
        :y2="HEIGHT * ratio"
        stroke="rgba(150, 190, 255, 0.08)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      <line
        x1="0"
        :y1="MIDDLE"
        :x2="WIDTH"
        :y2="MIDDLE"
        stroke="rgba(150, 190, 255, 0.16)"
        stroke-dasharray="4 6"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />

      <path :d="areaPath" :fill="`url(#${areaId})`" />
      <path
        :d="linePath"
        fill="none"
        :stroke="`url(#${lineId})`"
        stroke-width="2.4"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
      <circle
        v-for="(point, index) in points"
        :key="index"
        :cx="point.x"
        :cy="point.y"
        r="4"
        fill="#07101f"
        :stroke="index === 0 ? 'var(--neon)' : index === 2 ? 'var(--neon-2)' : '#c7d8f5'"
        stroke-width="2"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <div class="eq-curve__labels" aria-hidden="true">
      <span>LOW</span>
      <span>MID</span>
      <span>HIGH</span>
    </div>
  </div>
</template>

<style scoped>
.eq-curve {
  position: relative;
  height: 122px;
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid rgba(140, 185, 255, 0.09);
  border-radius: 10px;
  background:
    radial-gradient(ellipse at 50% 100%, rgba(var(--neon-rgb), 0.09), transparent 70%),
    rgba(3, 8, 17, 0.35);
  transition: opacity 0.25s var(--ease);
}

.eq-curve.is-disabled {
  opacity: 0.72;
}

.eq-curve svg {
  display: block;
  width: 100%;
  height: 100%;
}

.eq-curve__labels {
  position: absolute;
  right: 10px;
  bottom: 5px;
  left: 10px;
  display: flex;
  justify-content: space-between;
  color: var(--text-4);
  font-family: var(--font-display);
  font-size: 6.5px;
  letter-spacing: 0.14em;
  pointer-events: none;
}
</style>
