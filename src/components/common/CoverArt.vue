<script setup>
import { computed, ref, watch } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: 'cover' },
  rounded: { type: [Number, String], default: 10 },
})

const failed = ref(false)
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

const hue = computed(() => {
  let hash = 0
  for (const char of props.alt || 'music') hash = (hash * 31 + char.codePointAt(0)) % 360
  return hash
})

const initial = computed(() => (props.alt || 'M').trim().charAt(0).toUpperCase())
const style = computed(() => ({
  '--cover-hue': hue.value,
  borderRadius: typeof props.rounded === 'number' ? `${props.rounded}px` : props.rounded,
}))
</script>

<template>
  <div class="cover-art" :style="style">
    <img v-if="src && !failed" :src="src" :alt="alt" loading="lazy" draggable="false" @error="failed = true" />
    <div v-else class="cover-art__fallback" aria-hidden="true">
      <AppIcon name="music" :size="'46%'" :stroke-width="1.5" />
      <span class="cover-art__initial">{{ initial }}</span>
    </div>
  </div>
</template>

<style scoped>
.cover-art {
  position: relative;
  flex: none;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #09111f;
  isolation: isolate;
}

.cover-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
}

.cover-art__fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  background:
    radial-gradient(circle at 28% 22%, hsla(var(--cover-hue), 90%, 66%, 0.55), transparent 58%),
    radial-gradient(circle at 78% 82%, hsla(calc(var(--cover-hue) + 55), 85%, 58%, 0.4), transparent 62%),
    linear-gradient(145deg, #101a30, #060b16);
  color: rgba(255, 255, 255, 0.72);
}

.cover-art__initial {
  position: absolute;
  right: 8%;
  bottom: 2%;
  font-family: var(--font-display);
  font-size: clamp(14px, 5vw, 44px);
  font-weight: 700;
  line-height: 1;
  color: rgba(255, 255, 255, 0.12);
}
</style>
