<script setup lang="ts">
import { useFormatStore } from '@/stores/formatStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { presetNames } from '@/data/presets'
import type { BasedOnStyle } from '@/types/clangFormat'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SettingsModal from './SettingsModal.vue'

// SVG icons — light/dark variants
import settingsIconLight from '@/assets/icons/settings.svg?url'
import settingsIconDark from '@/assets/icons/settings_dark.svg?url'
import importIconLight from '@/assets/icons/import.svg?url'
import importIconDark from '@/assets/icons/import_dark.svg?url'
import exportIconLight from '@/assets/icons/export.svg?url'
import exportIconDark from '@/assets/icons/export_dark.svg?url'
import resetIconLight from '@/assets/icons/reset.svg?url'
import resetIconDark from '@/assets/icons/reset_dark.svg?url'
import themeIconLight from '@/assets/icons/theme.svg?url'
import themeIconDark from '@/assets/icons/theme_dark.svg?url'
import githubIconLight from '@/assets/icons/github.svg?url'
import githubIconDark from '@/assets/icons/github_dark.svg?url'

const store = useFormatStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()
const showExport = ref(false)
const showSettings = ref(false)
const isDark = computed(() => settingsStore.theme === 'dark')

// Theme-aware icon sources
const icons = computed(() => ({
  settings: isDark.value ? settingsIconDark : settingsIconLight,
  import: isDark.value ? importIconDark : importIconLight,
  export: isDark.value ? exportIconDark : exportIconLight,
  reset: isDark.value ? resetIconDark : resetIconLight,
  theme: isDark.value ? themeIconDark : themeIconLight,
  github: isDark.value ? githubIconDark : githubIconLight,
}))
const importErrorMsg = ref('')
let importErrorTimer: ReturnType<typeof setTimeout> | null = null

function showImportError(message: string) {
  importErrorMsg.value = message
  if (importErrorTimer !== null) {
    clearTimeout(importErrorTimer)
  }
  importErrorTimer = setTimeout(() => {
    importErrorMsg.value = ''
    importErrorTimer = null
  }, 5000)
}

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
    if (!file) return
    const text = await file.text()
    const { validateClangFormatYaml } = await import('@/lib/clangFormatValidation')
    const validation = validateClangFormatYaml(text)
    if (!validation.valid || !validation.config) {
      const firstMsg = validation.diagnostics[0]?.message ?? 'Invalid .clang-format file'
      showImportError(t('toolbar.importError', { message: firstMsg }))
      return
    }
    store.applyImportedConfig(validation.config as any)
  }
  input.click()
}

function resetConfig() {
  store.resetToPreset()
}

async function openGitHub() {
  try {
    const { open } = await import('@tauri-apps/plugin-shell')
    await open('https://github.com/Cra3z/clang-format-editor')
  } catch {
    window.open('https://github.com/Cra3z/clang-format-editor', '_blank')
  }
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
      <button @click="openGitHub" class="theme-btn icon-only" title="GitHub">
        <img :src="icons.github" class="btn-icon" alt="GitHub" />
      </button>
      <button @click="toggleTheme" class="theme-btn icon-only" :title="isDark ? t('toolbar.switchToLight') : t('toolbar.switchToDark')">
        <img :src="icons.theme" class="btn-icon" alt="theme" />
      </button>
      <button @click="showSettings = true" :title="t('toolbar.openSettings')"><img :src="icons.settings" class="btn-icon" alt="settings" /> {{ t('settings.title') }}</button>
      <button @click="handleImport" :title="t('toolbar.importFile')"><img :src="icons.import" class="btn-icon" alt="import" /> {{ t('common.actions.import') }}</button>
      <button @click="exportConfig" :title="t('toolbar.exportConfig')" class="primary"><img :src="icons.export" class="btn-icon" alt="export" /> {{ t('common.actions.export') }}</button>
      <button @click="resetConfig" :title="t('toolbar.resetToPreset')"><img :src="icons.reset" class="btn-icon" alt="reset" /> {{ t('common.actions.reset') }}</button>
    </div>

    <Transition name="toast">
      <div v-if="importErrorMsg" class="import-toast">
        {{ importErrorMsg }}
      </div>
    </Transition>

    <!-- Export overlay -->
    <div v-if="showExport" class="export-overlay" @click.self="showExport = false">
      <div class="export-modal">
        <div class="export-header">
          <h3>{{ t('toolbar.exportTitle') }}</h3>
          <button class="close-btn" @click="showExport = false">✕</button>
        </div>
        <pre class="export-content mono">{{ store.yamlOutput }}</pre>
        <div class="export-actions">
          <button class="copy-button" @click="copyToClipboard">{{ t('toolbar.copyToClipboard') }}</button>
          <button class="primary" @click="downloadFile"><img :src="icons.export" class="btn-icon" alt="download" /> {{ t('common.actions.downloadFile') }}</button>
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
  background: transparent;
  border-radius: var(--radius-md);

  &:hover {
    background: var(--bg-hover);
  }
}

.icon-only {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  vertical-align: middle;
  position: relative;
  top: -1px;
}

.import-toast {
  position: fixed;
  top: calc(var(--toolbar-height) + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: color-mix(in srgb, var(--error) 18%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, var(--error) 50%, transparent);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-size: var(--font-size-sm);
  max-width: 520px;
  text-align: center;
  z-index: 200;
  pointer-events: none;
  white-space: pre-wrap;
  word-break: break-word;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
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
