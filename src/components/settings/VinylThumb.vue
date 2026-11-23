<script setup>
import CoverArt from '@/components/common/CoverArt.vue'

defineProps({
  skin: { type: Object, required: true },
  cover: { type: String, default: '' },
  active: { type: Boolean, default: false },
})
</script>

<template>
  <div class="vinyl-thumb" :class="{ 'is-active': active }" :style="skin.vars">
    <div class="vinyl-thumb__disc">
      <span class="vinyl-thumb__grooves" />
      <span class="vinyl-thumb__label">
        <CoverArt :src="cover" :alt="skin.name" :rounded="'50%'" />
      </span>
      <span class="vinyl-thumb__hole" />
      <span class="vinyl-thumb__sheen" />
    </div>
  </div>
</template>

<style scoped>
.vinyl-thumb {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 12px;
  transition:
    border-color 0.2s var(--ease),
    background 0.2s var(--ease),
    box-shadow 0.2s var(--ease);
}

.vinyl-thumb.is-active {
  border-color: rgba(var(--neon-rgb), 0.45);
  background: rgba(var(--neon-rgb), 0.1);
  box-shadow: 0 0 22px rgba(var(--neon-rgb), 0.2);
}

.vinyl-thumb__disc {
  position: relative;
  display: grid;
  width: 58px;
  height: 58px;
  overflow: hidden;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle, var(--vinyl-groove) 0 0.6px, transparent 0.6px 2.6px),
    radial-gradient(circle at 50% 45%, var(--vinyl-base), var(--vinyl-edge));
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  place-items: center;
}

.vinyl-thumb__grooves {
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: repeating-radial-gradient(circle, transparent 0 1px, rgba(255, 255, 255, 0.04) 1px 1.6px);
  mask: radial-gradient(circle, transparent 0 33%, #000 34%);
  -webkit-mask: radial-gradient(circle, transparent 0 33%, #000 34%);
}

.vinyl-thumb__label {
  position: relative;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.vinyl-thumb__label :deep(.cover-art) {
  height: 100%;
}

.vinyl-thumb__hole {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #02040a;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18);
  transform: translate(-50%, -50%);
}

.vinyl-thumb__sheen {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 210deg,
    transparent 0deg,
    var(--vinyl-sheen) 30deg,
    transparent 72deg 220deg,
    rgba(255, 255, 255, 0.05) 250deg,
    transparent 290deg
  );
  mix-blend-mode: screen;
}
</style>
