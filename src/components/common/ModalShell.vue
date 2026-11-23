<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: 'MUSIC PLAYER' },
  icon: { type: String, default: 'settings' },
  width: { type: String, default: '760px' },
  closeOnBackdrop: { type: Boolean, default: true },
  closeLabel: { type: String, default: '关闭' },
})

const emit = defineEmits(['close'])

const windowElement = ref(null)
let previousFocus = null

function close() {
  emit('close')
}

function onBackdrop() {
  if (props.closeOnBackdrop) close()
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab') return
  const focusable = windowElement.value?.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  if (!focusable?.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(async () => {
  previousFocus = document.activeElement
  window.addEventListener('keydown', onKeydown)
  await nextTick()
  windowElement.value?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (previousFocus instanceof HTMLElement) previousFocus.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-layer" @pointerdown.self="onBackdrop">
      <section
        ref="windowElement"
        class="modal-window glass glass--strong"
        :style="{ '--modal-width': width }"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
      >
        <header class="modal-window__head">
          <div class="modal-window__identity">
            <span class="modal-window__icon">
              <AppIcon :name="icon" :size="18" />
            </span>
            <div class="modal-window__text">
              <p class="eyebrow">{{ subtitle }}</p>
              <h2>{{ title }}</h2>
            </div>
          </div>
          <button type="button" class="icon-button modal-window__close" :aria-label="closeLabel" @click="close">
            <AppIcon name="close" :size="17" />
          </button>
        </header>
        <div class="modal-window__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal-window__footer">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-layer {
  position: fixed;
  z-index: 120;
  inset: 0;
  display: grid;
  padding: 28px;
  overflow: auto;
  background: rgba(1, 3, 9, 0.62);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  animation: fade-in 0.25s var(--ease);
}

.modal-window {
  display: flex;
  flex-direction: column;
  width: min(var(--modal-width), 100%);
  max-height: min(840px, calc(100vh - 48px));
  margin: auto;
  overflow: hidden;
  outline: none;
  animation: scale-in 0.42s var(--ease-spring);
}

.modal-window__head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  padding: 0 22px 0 24px;
  border-bottom: 1px solid var(--line);
}

.modal-window__identity {
  display: flex;
  gap: 13px;
  align-items: center;
}

.modal-window__icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(var(--neon-rgb), 0.35);
  border-radius: 11px;
  background: linear-gradient(140deg, rgba(var(--neon-rgb), 0.3), rgba(var(--neon-2-rgb), 0.18));
  box-shadow:
    0 0 22px rgba(var(--neon-rgb), 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  color: #dce9ff;
}

.modal-window__text .eyebrow {
  margin-bottom: 2px;
  font-size: 8px;
  letter-spacing: 0.24em;
}

.modal-window__text h2 {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.modal-window__close {
  width: 34px;
  height: 34px;
}

.modal-window__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.modal-window__footer {
  display: flex;
  flex: none;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  height: 68px;
  padding: 0 24px;
  border-top: 1px solid var(--line);
  background: rgba(3, 8, 17, 0.35);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: translateY(22px) scale(0.975);
  }
}
</style>
