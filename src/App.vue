<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from './stores/settingsStore'
import SideNav from './components/SideNav.vue'
import Toolbar from './components/Toolbar.vue'
import CodePreview from './components/CodePreview.vue'

const settingsStore = useSettingsStore()
const route = useRoute()

const OUTER_SPLITTER_STORAGE_KEY = 'layout-option-panel-percent'
const OUTER_SPLITTER_WIDTH = 6
const PANEL_HARD_MIN_WIDTH = 220
const OPTIONS_PANEL_IDEAL_MIN_WIDTH = 320
const PREVIEW_PANEL_IDEAL_MIN_WIDTH = 320

function readStoredOptionPanelPercent() {
  const stored = Number(localStorage.getItem(OUTER_SPLITTER_STORAGE_KEY))
  if (Number.isFinite(stored)) {
    return Math.min(65, Math.max(30, stored))
  }

  return 43
}

const optionPanelPercent = ref(readStoredOptionPanelPercent())
const isDragging = ref(false)
const appContent = ref<HTMLElement | null>(null)
const optionsPanel = ref<HTMLElement | null>(null)
let appContentResizeObserver: ResizeObserver | null = null

function getOptionPanelBounds(containerWidth: number) {
  const minOptionWidth = Math.min(
    OPTIONS_PANEL_IDEAL_MIN_WIDTH,
    Math.max(PANEL_HARD_MIN_WIDTH, containerWidth - PREVIEW_PANEL_IDEAL_MIN_WIDTH - OUTER_SPLITTER_WIDTH),
  )
  const minPreviewWidth = Math.min(
    PREVIEW_PANEL_IDEAL_MIN_WIDTH,
    Math.max(PANEL_HARD_MIN_WIDTH, containerWidth - minOptionWidth - OUTER_SPLITTER_WIDTH),
  )

  return {
    minOptionWidth,
    maxOptionWidth: Math.max(minOptionWidth, containerWidth - minPreviewWidth - OUTER_SPLITTER_WIDTH),
  }
}

function clampOptionPanelPercent(percent: number, containerWidth: number) {
  const safePercent = Math.min(65, Math.max(30, percent))
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) {
    return safePercent
  }

  const { minOptionWidth, maxOptionWidth } = getOptionPanelBounds(containerWidth)
  const currentWidth = (safePercent / 100) * containerWidth
  const clampedWidth = Math.min(maxOptionWidth, Math.max(minOptionWidth, currentWidth))
  return (clampedWidth / containerWidth) * 100
}

function syncOptionPanelPercent() {
  const containerWidth = appContent.value?.getBoundingClientRect().width ?? 0
  optionPanelPercent.value = clampOptionPanelPercent(optionPanelPercent.value, containerWidth)
}

function onSplitterDown(e: PointerEvent) {
  isDragging.value = true
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function onSplitterMove(e: PointerEvent) {
  if (!isDragging.value || !appContent.value) {
    return
  }

  const rect = appContent.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  optionPanelPercent.value = clampOptionPanelPercent((x / rect.width) * 100, rect.width)
}

function onSplitterUp() {
  isDragging.value = false
}

watch(optionPanelPercent, (value) => {
  localStorage.setItem(OUTER_SPLITTER_STORAGE_KEY, String(value))
})

watch(() => route.path, async () => {
  await nextTick()
  optionsPanel.value?.scrollTo({ top: 0, behavior: 'auto' })
})

onMounted(() => {
  void settingsStore.refreshDetectedClangFormat()

  syncOptionPanelPercent()

  if (appContent.value) {
    appContentResizeObserver = new ResizeObserver(() => {
      syncOptionPanelPercent()
    })
    appContentResizeObserver.observe(appContent.value)
  }
})

onBeforeUnmount(() => {
  appContentResizeObserver?.disconnect()
})
</script>

<template>
  <div class="app-layout">
    <Toolbar />
    <div class="app-body">
      <SideNav />
      <main ref="appContent" class="app-content">
        <div ref="optionsPanel" class="options-panel" :style="{ width: optionPanelPercent + '%' }">
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
  min-width: 0;
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
  min-width: 0;
}
</style>
