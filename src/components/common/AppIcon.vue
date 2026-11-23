<script setup>
import { computed } from 'vue'

import { ICONS } from '@/utils/icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  strokeWidth: { type: [Number, String], default: 1.7 },
  filled: { type: Boolean, default: false },
  label: { type: String, default: '' },
})

const content = computed(() => ICONS[props.name] ?? ICONS.music)
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="filled ? 'currentColor' : 'none'"
    :stroke="filled ? 'none' : 'currentColor'"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    v-html="content"
  />
</template>

<style scoped>
.app-icon {
  flex: none;
  overflow: visible;
}
</style>
