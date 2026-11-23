<script setup>
import { useUiStore } from '@/stores/ui'
import AppIcon from '@/components/common/AppIcon.vue'

const ui = useUiStore()

const icons = {
  success: 'check',
  error: 'close',
  warning: 'sparkles',
  info: 'info',
  music: 'music',
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-host" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="item in ui.toasts" :key="item.id" class="toast" :class="`toast--${item.type}`">
          <span class="toast__icon">
            <AppIcon :name="icons[item.type] || 'info'" :size="15" />
          </span>
          <p>{{ item.message }}</p>
          <button type="button" class="toast__close" aria-label="关闭提示" @click="ui.dismissToast(item.id)">
            <AppIcon name="close" :size="12" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-host {
  position: fixed;
  z-index: 220;
  top: 78px;
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: 9px;
  align-items: center;
  width: min(560px, calc(100vw - 48px));
  pointer-events: none;
  transform: translateX(-50%);
}

.toast {
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: 100%;
  padding: 9px 10px 9px 12px;
  border: 1px solid rgba(145, 190, 255, 0.16);
  border-radius: 12px;
  background: rgba(7, 14, 28, 0.84);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  pointer-events: auto;
}

.toast__icon {
  display: grid;
  flex: none;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 7px;
  background: rgba(var(--neon-rgb), 0.16);
  color: var(--neon);
}

.toast p {
  flex: 1;
  min-width: 0;
  color: var(--text-1);
  font-size: 12.5px;
  line-height: 1.45;
}

.toast__close {
  display: grid;
  flex: none;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 6px;
  color: var(--text-3);
  transition:
    color 0.2s,
    background 0.2s;
}

.toast__close:hover {
  color: var(--text-1);
  background: rgba(255, 255, 255, 0.06);
}

.toast--success .toast__icon {
  background: rgba(61, 220, 151, 0.14);
  color: var(--success);
}

.toast--error .toast__icon {
  background: rgba(255, 93, 122, 0.14);
  color: var(--danger);
}

.toast--warning .toast__icon {
  background: rgba(255, 207, 92, 0.14);
  color: var(--warning);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.28s var(--ease),
    transform 0.28s var(--ease);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
}
</style>
