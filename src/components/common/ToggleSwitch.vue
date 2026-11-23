<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    class="toggle"
    :class="{ 'is-on': modelValue }"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label || undefined"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="toggle__track">
      <span class="toggle__thumb" />
    </span>
  </button>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  flex: none;
  align-items: center;
  padding: 2px;
  border-radius: 99px;
}

.toggle__track {
  position: relative;
  display: block;
  width: 42px;
  height: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.35);
  transition:
    background 0.28s var(--ease),
    border-color 0.28s var(--ease),
    box-shadow 0.28s var(--ease);
}

.toggle__thumb {
  position: absolute;
  top: 50%;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #a9b8d0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  transform: translateY(-50%);
  transition:
    left 0.28s var(--ease-spring),
    background 0.28s var(--ease),
    box-shadow 0.28s var(--ease);
}

.toggle.is-on .toggle__track {
  border-color: rgba(var(--neon-rgb), 0.55);
  background: linear-gradient(135deg, rgba(var(--neon-rgb), 0.65), rgba(var(--neon-2-rgb), 0.65));
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.18),
    0 0 16px rgba(var(--neon-rgb), 0.35);
}

.toggle.is-on .toggle__thumb {
  left: 19px;
  background: #fff;
  box-shadow:
    0 0 10px rgba(var(--neon-rgb), 0.8),
    0 2px 5px rgba(0, 0, 0, 0.35);
}
</style>
