<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { presetNames } from '@/data/presets'
import type { BasedOnStyle } from '@/types/clangFormat'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SettingsModal from './SettingsModal.vue'

const store = useFormatStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()
const showExport = ref(false)
const showSettings = ref(false)
const isDark = computed(() => settingsStore.theme === 'dark')

function toggleTheme() {
  settingsStore.theme = settingsStore.theme === 'dark' ? 'light' : 'dark'
}

function handlePresetChange(e: Event) {
  const target = e.target as HTMLSelectElement
  store.setPreset(target.value as BasedOnStyle)
}

function exportConfig() {
  showExport.value = !showExport.value
}

function copyToClipboard() {
  navigator.clipboard.writeText(store.yamlOutput)
}

function downloadFile() {
  const blob = new Blob([store.yamlOutput], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '.clang-format'
  a.click()
  URL.revokeObjectURL(url)
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.clang-format,.yaml,.yml'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (file) {
      const text = await file.text()
      store.importYaml(text)
    }
  }
  input.click()
}

function resetConfig() {
  store.resetToPreset()
}
</script>

<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <h1 class="app-title">{{ t('app.title') }}</h1>
    </div>

    <div class="toolbar-center">
      <label class="preset-label">
        <span>{{ t('toolbar.baseStyle') }}</span>
        <select :value="store.activePreset" @change="handlePresetChange">
          <option v-for="name in presetNames" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </label>
    </div>

    <div class="toolbar-right">
      <button @click="toggleTheme" class="theme-btn" :title="isDark ? t('toolbar.switchToLight') : t('toolbar.switchToDark')">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
      <button @click="showSettings = true" :title="t('toolbar.openSettings')">⚙️ {{ t('settings.title') }}</button>
      <button @click="handleImport" :title="t('toolbar.importFile')">📂 {{ t('common.actions.import') }}</button>
      <button @click="exportConfig" :title="t('toolbar.exportConfig')" class="primary">💾 {{ t('common.actions.export') }}</button>
      <button @click="resetConfig" :title="t('toolbar.resetToPreset')">🔄 {{ t('common.actions.reset') }}</button>
    </div>

    <!-- Export overlay -->
    <div v-if="showExport" class="export-overlay" @click.self="showExport = false">
      <div class="export-modal">
        <div class="export-header">
          <h3>{{ t('toolbar.exportTitle') }}</h3>
          <button class="close-btn" @click="showExport = false">✕</button>
        </div>
        <pre class="export-content mono">{{ store.yamlOutput }}</pre>
        <div class="export-actions">
          <button class="copy-button" @click="copyToClipboard">📋 {{ t('toolbar.copyToClipboard') }}</button>
          <button class="primary" @click="downloadFile">💾 {{ t('common.actions.downloadFile') }}</button>
        </div>
      </div>
    </div>

    <SettingsModal :open="showSettings" @close="showSettings = false" />
  </header>
</template>

<style scoped lang="scss">
.toolbar {
  height: var(--toolbar-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.preset-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);

  select {
    min-width: 140px;
  }
}

.toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.theme-btn {
  padding: 6px 8px;
  font-size: 16px;
  background: transparent;
  border-radius: var(--radius-md);

  &:hover {
    background: var(--bg-hover);
  }
}

.export-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.export-modal {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.export-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);

  h3 {
    font-size: var(--font-size-lg);
    font-weight: 600;
  }
}

.close-btn {
  background: transparent;
  font-size: 16px;
  padding: 4px 8px;
}

.copy-button {
  transition: background-color var(--transition-fast), box-shadow var(--transition-fast), filter var(--transition-fast);

  &:hover {
    background: color-mix(in srgb, var(--accent) 18%, var(--bg-surface));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent);
    filter: brightness(1.06);
  }
}

.export-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  white-space: pre-wrap;
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.export-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}
</style>
