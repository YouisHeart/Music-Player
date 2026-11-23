<script setup>
import { computed, ref } from 'vue'

import { clamp } from '@/utils/format'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 1 },
  step: { type: Number, default: 0.01 },
  buffer: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
  tooltip: { type: Boolean, default: false },
  label: { type: String, default: '数值' },
  formatValue: { type: Function, default: null },
})

const emit = defineEmits(['update:modelValue', 'change', 'drag-start', 'drag-end'])

const track = ref(null)
const dragging = ref(false)
const hovering = ref(false)

const range = computed(() => props.max - props.min || 1)
const percent = computed(() => clamp((props.modelValue - props.min) / range.value, 0, 1) * 100)
const bufferPercent = computed(() => clamp(props.buffer / range.value, 0, 1) * 100)
const showTip = computed(() => props.tooltip && (dragging.value || hovering.value))
const tipLabel = computed(() => {
  if (props.formatValue) return props.formatValue(props.modelValue)
  return `${Math.round(percent.value)}%`
})

function ratioFromEvent(event) {
  const element = track.value
  if (!element) return 0
  const rect = element.getBoundingClientRect()
  return clamp((event.clientX - rect.left) / rect.width, 0, 1)
}

function quantize(ratio) {
  const raw = props.min + ratio * range.value
  const stepped = Math.round(raw / props.step) * props.step
  const decimals = String(props.step).split('.')[1]?.length ?? 2
  return clamp(Number(stepped.toFixed(decimals)), props.min, props.max)
}

function emitValue(event) {
  const value = quantize(ratioFromEvent(event))
  emit('update:modelValue', value)
  return value
}

function onPointerDown(event) {
  if (props.disabled) return
  event.preventDefault()
  dragging.value = true
  track.value?.setPointerCapture?.(event.pointerId)
  emit('drag-start')
  emitValue(event)
}

function onPointerMove(event) {
  if (dragging.value) emitValue(event)
}

function onPointerUp(event) {
  if (!dragging.value) return
  dragging.value = false
  const value = quantize(ratioFromEvent(event))
  track.value?.releasePointerCapture?.(event.pointerId)
  emit('change', value)
  emit('drag-end')
}

function onPointerCancel() {
  if (!dragging.value) return
  dragging.value = false
  emit('change', props.modelValue)
  emit('drag-end')
}

function onKeydown(event) {
  if (props.disabled) return
  const increment = event.shiftKey ? props.step * 10 : props.step
  let next = null
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = props.modelValue + increment
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = props.modelValue - increment
  else if (event.key === 'Home') next = props.min
  else if (event.key === 'End') next = props.max
  if (next === null) return
  event.preventDefault()
  const value = clamp(Number(next.toFixed(4)), props.min, props.max)
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <div
    ref="track"
    class="neon-slider"
    :class="{ 'is-compact': compact, 'is-dragging': dragging, 'is-disabled': disabled }"
    role="slider"
    :tabindex="disabled ? -1 : 0"
    :aria-label="label"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="modelValue"
    :aria-disabled="disabled"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @pointerenter="hovering = true"
    @pointerleave="hovering = false"
    @keydown="onKeydown"
  >
    <div class="neon-slider__rail">
      <div class="neon-slider__buffer" :style="{ width: `${bufferPercent}%` }" />
      <div class="neon-slider__fill" :style="{ width: `${percent}%` }" />
      <span class="neon-slider__thumb" :style="{ left: `${percent}%` }" />
    </div>
    <span v-if="showTip" class="neon-slider__tip" :style="{ left: `${percent}%` }">{{ tipLabel }}</span>
  </div>
</template>

<style scoped>
.neon-slider {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 22px;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}

.neon-slider.is-compact {
  height: 16px;
}

.neon-slider.is-disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.neon-slider__rail {
  position: relative;
  width: 100%;
  height: 4px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.09);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
}

.neon-slider.is-compact .neon-slider__rail {
  height: 3px;
}

.neon-slider__buffer {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.14);
}

.neon-slider__fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--neon), var(--neon-2));
  box-shadow: 0 0 10px rgba(var(--neon-rgb), 0.55);
}

.neon-slider__thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--neon);
  box-shadow:
    0 0 0 3px rgba(var(--neon-rgb), 0.18),
    0 0 14px rgba(var(--neon-rgb), 0.75);
  opacity: 0.72;
  transform: translateY(-50%) scale(0.82);
  transition:
    opacity 0.2s var(--ease),
    transform 0.2s var(--ease-spring);
}

.neon-slider:hover .neon-slider__thumb,
.neon-slider:focus-visible .neon-slider__thumb,
.neon-slider.is-dragging .neon-slider__thumb {
  opacity: 1;
  transform: translateY(-50%) scale(1.12);
}

.neon-slider__tip {
  position: absolute;
  bottom: 18px;
  z-index: 4;
  padding: 3px 7px;
  border: 1px solid rgba(var(--neon-rgb), 0.3);
  border-radius: 6px;
  background: rgba(5, 11, 22, 0.92);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  color: var(--text-1);
  font-family: var(--font-display);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  transform: translateX(-50%);
  white-space: nowrap;
}

.neon-slider.is-compact .neon-slider__tip {
  bottom: 14px;
}
</style>
