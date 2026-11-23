<script setup>
import AboutContent from '@/components/about/AboutContent.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import ModalShell from '@/components/common/ModalShell.vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <ModalShell title="关于我们" subtitle="ABOUT THIS PLAYER" icon="info" width="680px" @close="ui.closeAbout()">
    <div class="about-window-body scroll-area">
      <AboutContent />
    </div>
    <template #footer>
      <button type="button" class="primary-button" @click="ui.closeAbout()">
        <AppIcon name="play" :size="13" filled />
        开始聆听
      </button>
    </template>
  </ModalShell>
</template>

<style scoped>
.about-window-body {
  height: 100%;
  overflow-y: auto;
}
</style>
