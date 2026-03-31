<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useSettingsStore } from './stores/settingsStore'
import SideNav from './components/SideNav.vue'
import Toolbar from './components/Toolbar.vue'
import CodePreview from './components/CodePreview.vue'

const settingsStore = useSettingsStore()

const OUTER_SPLITTER_STORAGE_KEY = 'layout-option-panel-percent'

function readStoredOptionPanelPercent() {
  const stored = Number(localStorage.getItem(OUTER_SPLITTER_STORAGE_KEY))
  if (Number.isFinite(stored)) {
    return Math.min(65, Math.max(30, stored))
  }

  return 43
}

const optionPanelPercent = ref(readStoredOptionPanelPercent())
const isDragging = ref(false)

function onSplitterDown(e: PointerEvent) {
  isDragging.value = true
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function onSplitterMove(e: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  const content = document.querySelector('.app-content') as HTMLElement | null
  if (!content) {
    return
  }

  const rect = content.getBoundingClientRect()
  const x = e.clientX - rect.left
  const pct = Math.min(65, Math.max(30, (x / rect.width) * 100))
  optionPanelPercent.value = pct
}

function onSplitterUp() {
  isDragging.value = false
}

watch(optionPanelPercent, (value) => {
  localStorage.setItem(OUTER_SPLITTER_STORAGE_KEY, String(value))
})

onMounted(() => {
  void settingsStore.refreshDetectedClangFormat()
})
</script>

<template>
  <div class="app-layout">
    <Toolbar />
    <div class="app-body">
      <SideNav />
      <main class="app-content">
        <div class="options-panel" :style="{ width: optionPanelPercent + '%' }">
          <router-view />
        </div>
        <div
          class="panel-splitter"
          :class="{ 'is-dragging': isDragging }"
          @pointerdown.prevent="onSplitterDown"
          @pointermove="onSplitterMove"
          @pointerup="onSplitterUp"
          @pointercancel="onSplitterUp"
        ></div>
        <div class="preview-panel" :style="{ width: (100 - optionPanelPercent) + '%' }">
          <CodePreview />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.options-panel {
  flex: 0 0 auto;
  overflow-y: auto;
  padding: 16px 20px;
  border-right: 1px solid var(--border-color);
  min-width: 380px;
}

.panel-splitter {
  width: 6px;
  flex: 0 0 6px;
  background: var(--border-color);
  cursor: col-resize;
  transition: background var(--transition-fast);

  &:hover,
  &.is-dragging {
    background: var(--accent);
  }
}

.preview-panel {
  flex: 0 0 auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 420px;
}
</style>
