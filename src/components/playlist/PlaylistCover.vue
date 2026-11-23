<script setup>
import { computed } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  tracks: { type: Array, default: () => [] },
  icon: { type: String, default: 'music' },
})

const covers = computed(() => {
  const unique = []
  for (const track of props.tracks) {
    if (track.cover && !unique.includes(track.cover)) unique.push(track.cover)
    if (unique.length === 4) break
  }
  return unique
})
</script>

<template>
  <div class="playlist-cover">
    <div v-if="covers.length >= 2" class="playlist-cover__mosaic" :class="`count-${covers.length}`">
      <img v-for="(src, index) in covers.slice(0, 4)" :key="`${src}-${index}`" :src="src" alt="" loading="lazy" />
    </div>
    <img v-else-if="covers.length === 1" class="playlist-cover__single" :src="covers[0]" alt="" loading="lazy" />
    <div v-else class="playlist-cover__fallback">
      <AppIcon :name="icon" :size="34" :stroke-width="1.4" />
    </div>
    <span class="playlist-cover__shade" />
  </div>
</template>

<style scoped>
.playlist-cover {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  background: #07101e;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-cover__mosaic {
  display: grid;
  width: 100%;
  height: 100%;
  gap: 2px;
}

.playlist-cover__mosaic img {
  min-width: 0;
  min-height: 0;
  display: block;
}

.playlist-cover__mosaic.count-2 {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.playlist-cover__mosaic.count-3 {
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
}

.playlist-cover__mosaic.count-3 img:first-child {
  grid-row: span 2;
  min-height: 0;
}

.playlist-cover__mosaic.count-4 {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
}

.playlist-cover__single {
  position: absolute;
  inset: 0;
}

.playlist-cover__fallback {
  display: grid;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 32% 24%, rgba(var(--neon-rgb), 0.4), transparent 56%),
    radial-gradient(circle at 74% 78%, rgba(var(--neon-2-rgb), 0.32), transparent 60%),
    linear-gradient(145deg, #0d1830, #050a15);
  color: rgba(225, 238, 255, 0.7);
  place-items: center;
}

.playlist-cover__shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(4, 9, 18, 0.05) 30%, rgba(4, 9, 18, 0.55) 100%),
    radial-gradient(circle at 50% 0%, rgba(var(--neon-rgb), 0.12), transparent 60%);
  pointer-events: none;
}
</style>
