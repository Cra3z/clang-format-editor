<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { open as openDialog } from '@tauri-apps/plugin-dialog'
import { useSettingsStore, type AppLocale, type AppTheme } from '@/stores/settingsStore'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()
const themeDraft = ref<AppTheme>(settingsStore.theme)
const clangFormatExecutablePathDraft = ref(settingsStore.clangFormatExecutablePath)
const localeDraft = ref<AppLocale>(settingsStore.locale)
const clangFormatVersion = ref('')
const clangFormatVersionError = ref('')
const isCheckingVersion = ref(false)
let versionCheckTimeout: ReturnType<typeof setTimeout> | null = null

const isTauri = '__TAURI_INTERNALS__' in window

const hasDraftChanges = computed(() => {
  return themeDraft.value !== settingsStore.theme
    || clangFormatExecutablePathDraft.value.trim() !== settingsStore.clangFormatExecutablePath
    || localeDraft.value !== settingsStore.locale
})

const clangFormatInputPlaceholder = computed(() => {
  return settingsStore.detectedClangFormatExecutablePath
    || '自动检测到的 clang-format 绝对路径会显示在这里'
})

const clangFormatStatus = computed(() => {
  if (isCheckingVersion.value || settingsStore.isDetectingClangFormat) {
    return {
      kind: 'pending',
      text: '检测中...',
      title: '',
    }
  }

  if (clangFormatVersion.value) {
    return {
      kind: 'success',
      text: clangFormatVersion.value,
      title: clangFormatVersion.value,
    }
  }

  return {
    kind: 'error',
    text: '未知的clang-format',
    title: clangFormatVersionError.value || '未检测到可用的 clang-format',
  }
})

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return fallback
}

function syncDraftFromStore() {
  themeDraft.value = settingsStore.theme
  clangFormatExecutablePathDraft.value = settingsStore.clangFormatExecutablePath
  localeDraft.value = settingsStore.locale

  if (clangFormatExecutablePathDraft.value.trim()) {
    clangFormatVersion.value = ''
    clangFormatVersionError.value = ''
    return
  }

  clangFormatVersion.value = settingsStore.detectedClangFormatVersion
  clangFormatVersionError.value = ''
}

function scheduleVersionCheck() {
  if (versionCheckTimeout) {
    clearTimeout(versionCheckTimeout)
  }

  versionCheckTimeout = setTimeout(() => {
    void checkClangFormatVersion()
  }, 450)
}

async function checkClangFormatVersion() {
  clangFormatVersion.value = ''
  clangFormatVersionError.value = ''

  if (!isTauri) {
    clangFormatVersionError.value = '当前是浏览器预览模式，无法检测 clang-format 可执行文件。'
    return
  }

  isCheckingVersion.value = true

  try {
    const target = clangFormatExecutablePathDraft.value.trim() || settingsStore.detectedClangFormatExecutablePath

    if (!target) {
      const detected = await settingsStore.refreshDetectedClangFormat(true)
      if (!detected) {
        throw new Error('未检测到可用的 clang-format，可手动浏览选择程序文件。')
      }

      clangFormatVersion.value = detected.version
      return
    }

    const info = await settingsStore.inspectClangFormat(target)
    clangFormatVersion.value = info.version
  } catch (error) {
    clangFormatVersionError.value = getErrorMessage(error, '无法检测 clang-format 版本。')
  } finally {
    isCheckingVersion.value = false
  }
}

async function browseExecutablePath() {
  if (!isTauri) {
    clangFormatVersionError.value = '当前是浏览器预览模式，无法浏览本机可执行文件。'
    return
  }

  try {
    const selected = await openDialog({
      directory: false,
      multiple: false,
      title: '选择 clang-format 可执行文件',
      defaultPath: clangFormatExecutablePathDraft.value.trim() || settingsStore.detectedClangFormatExecutablePath || undefined,
    })

    if (typeof selected === 'string') {
      clangFormatExecutablePathDraft.value = selected
      void checkClangFormatVersion()
    }
  } catch (error) {
    clangFormatVersionError.value = getErrorMessage(error, '打开文件选择器失败。')
  }
}

function applySettings() {
  settingsStore.theme = themeDraft.value
  settingsStore.clangFormatExecutablePath = clangFormatExecutablePathDraft.value.trim()
  settingsStore.locale = localeDraft.value
  emit('close')
}

function handleCancel() {
  syncDraftFromStore()
  emit('close')
}

function handleSettingsEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.open) {
    return
  }

  event.preventDefault()
  handleCancel()
}

watch(() => props.open, async (open) => {
  window.removeEventListener('keydown', handleSettingsEscape)

  if (versionCheckTimeout) {
    clearTimeout(versionCheckTimeout)
    versionCheckTimeout = null
  }

  if (!open) {
    return
  }

  window.addEventListener('keydown', handleSettingsEscape)
  await settingsStore.refreshDetectedClangFormat()
  syncDraftFromStore()

  if (clangFormatExecutablePathDraft.value.trim() || settingsStore.detectedClangFormatExecutablePath) {
    void checkClangFormatVersion()
  }
})

watch(clangFormatExecutablePathDraft, () => {
  clangFormatVersion.value = clangFormatExecutablePathDraft.value.trim()
    ? ''
    : settingsStore.detectedClangFormatVersion
  clangFormatVersionError.value = ''

  if (clangFormatExecutablePathDraft.value.trim()) {
    scheduleVersionCheck()
  }
})

watch(() => settingsStore.detectedClangFormatExecutablePath, () => {
  if (!props.open || clangFormatExecutablePathDraft.value.trim()) {
    return
  }

  clangFormatVersion.value = settingsStore.detectedClangFormatVersion
  clangFormatVersionError.value = ''
})

onBeforeUnmount(() => {
  if (versionCheckTimeout) {
    clearTimeout(versionCheckTimeout)
  }
  window.removeEventListener('keydown', handleSettingsEscape)
})
</script>

<template>
  <div v-if="props.open" class="settings-overlay">
    <div class="settings-modal">
      <div class="settings-header">
        <div>
          <h3>设置</h3>
          <p>管理应用主题、clang-format 可执行文件路径，以及后续会扩展的区域设置。</p>
        </div>
        <button class="settings-close" @click="handleCancel">关闭</button>
      </div>

      <div class="settings-content">
        <section class="settings-section">
          <div class="settings-section-title">外观</div>
          <label class="settings-field">
            <span>主题</span>
            <select v-model="themeDraft">
              <option value="dark">深色</option>
              <option value="light">浅色</option>
            </select>
          </label>
        </section>

        <section class="settings-section">
          <div class="settings-section-title">clang-format</div>
          <div class="settings-field">
            <span>程序文件路径</span>
            <div class="settings-input-group">
              <input
                v-model="clangFormatExecutablePathDraft"
                class="settings-input"
                type="text"
                :placeholder="clangFormatInputPlaceholder"
              />
              <button type="button" class="settings-browse-button" @click="browseExecutablePath">浏览...</button>
            </div>
          </div>
          <div class="settings-version-row">
            <span
              class="settings-version-tag"
              :class="`is-${clangFormatStatus.kind}`"
              :title="clangFormatStatus.title || undefined"
            >
              {{ clangFormatStatus.text }}
            </span>
          </div>
          <div v-if="clangFormatVersionError" class="settings-error">
            {{ clangFormatVersionError }}
          </div>
        </section>

        <section class="settings-section">
          <div class="settings-section-title">区域设置</div>
          <label class="settings-field">
            <span>界面语言</span>
            <select v-model="localeDraft">
              <option value="system">跟随系统</option>
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </label>
          <div class="settings-note">该选项目前仅保存设置，尚未驱动界面文案切换，后续可以继续扩展。</div>
        </section>
      </div>

      <div class="settings-footer">
        <div class="settings-footer-hint" v-if="hasDraftChanges">你有尚未应用的更改。</div>
        <div class="settings-footer-actions">
          <button @click="handleCancel">取消</button>
          <button class="primary" @click="applySettings">应用</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(0 0 0 / 0.56);
  backdrop-filter: blur(6px);
}

.settings-modal {
  width: min(720px, calc(100vw - 48px));
  max-height: min(760px, calc(100vh - 48px));
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 24px 80px rgb(0 0 0 / 0.4);
  overflow: hidden;
}

.settings-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);

  h3 {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    margin-top: 6px;
    font-size: var(--font-size-sm);
    line-height: 1.6;
    color: var(--text-secondary);
  }
}

.settings-close {
  flex-shrink: 0;
}

.settings-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: color-mix(in srgb, var(--bg-secondary) 65%, transparent);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.settings-section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }
}

.settings-input-group {
  display: flex;
  align-items: stretch;
}

.settings-input {
  flex: 1;
  min-width: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.settings-browse-button {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid var(--border-color);
  border-left: none;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  background: var(--bg-surface);
}

.settings-inline-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.settings-version-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 2px 0;
}

.settings-version-tag {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 4px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.settings-version-tag.is-success {
  color: var(--success);
  background: color-mix(in srgb, var(--success) 12%, var(--bg-secondary));
}

.settings-version-tag.is-error {
  color: var(--error);
  background: color-mix(in srgb, var(--error) 12%, var(--bg-secondary));
}

.settings-version-tag.is-pending {
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--border-color) 20%, var(--bg-secondary));
}

.settings-note {
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--text-secondary);
}

.settings-success,
.settings-error {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.settings-success {
  color: var(--success);
  background: color-mix(in srgb, var(--success) 14%, transparent);
}

.settings-error {
  color: var(--error);
  background: color-mix(in srgb, var(--error) 12%, transparent);
}

.settings-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.settings-footer-hint {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.settings-footer-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

@media (max-width: 720px) {
  .settings-content {
    padding: 14px;
  }

  .settings-section {
    padding: 14px;
  }

  .settings-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .settings-footer-actions {
    margin-left: 0;
    justify-content: flex-end;
  }
}
</style>