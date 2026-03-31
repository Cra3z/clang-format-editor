<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { open as openDialog } from '@tauri-apps/plugin-dialog'
import { useSettingsStore, type AppLocale, type AppTheme } from '@/stores/settingsStore'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()
const { t } = useI18n()
const themeDraft = ref<AppTheme>(settingsStore.theme)
const clangFormatExecutablePathDraft = ref(settingsStore.clangFormatExecutablePath)
const localeDraft = ref<AppLocale>(settingsStore.locale)
const clangFormatVersion = ref('')
const clangFormatVersionError = ref('')
const isCheckingVersion = ref(false)
let versionCheckTimeout: ReturnType<typeof setTimeout> | null = null

const isTauri = '__TAURI_INTERNALS__' in window

const clangFormatInputPlaceholder = computed(() => {
  return settingsStore.detectedClangFormatExecutablePath
    || t('settings.clangFormat.placeholder')
})

const clangFormatStatus = computed(() => {
  if (isCheckingVersion.value || settingsStore.isDetectingClangFormat) {
    return {
      kind: 'pending',
      text: t('settings.clangFormat.status.pending'),
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
    text: t('settings.clangFormat.status.unknown'),
    title: clangFormatVersionError.value || t('settings.clangFormat.errors.detectFailed'),
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
    settingsStore.clangFormatExecutablePath = clangFormatExecutablePathDraft.value.trim()
    void checkClangFormatVersion()
  }, 450)
}

async function checkClangFormatVersion() {
  clangFormatVersion.value = ''
  clangFormatVersionError.value = ''

  if (!isTauri) {
    clangFormatVersionError.value = t('settings.clangFormat.errors.browserVersion')
    return
  }

  isCheckingVersion.value = true

  try {
    const target = clangFormatExecutablePathDraft.value.trim() || settingsStore.detectedClangFormatExecutablePath

    if (!target) {
      const detected = await settingsStore.refreshDetectedClangFormat(true)
      if (!detected) {
        throw new Error(t('settings.clangFormat.errors.detectFailed'))
      }

      clangFormatVersion.value = detected.version
      return
    }

    const info = await settingsStore.inspectClangFormat(target)
    clangFormatVersion.value = info.version
  } catch (error) {
    clangFormatVersionError.value = getErrorMessage(error, t('settings.clangFormat.errors.inspectFailed'))
  } finally {
    isCheckingVersion.value = false
  }
}

async function browseExecutablePath() {
  if (!isTauri) {
    clangFormatVersionError.value = t('settings.clangFormat.errors.browserBrowse')
    return
  }

  try {
    const selected = await openDialog({
      directory: false,
      multiple: false,
      title: t('settings.clangFormat.browseTitle'),
      defaultPath: clangFormatExecutablePathDraft.value.trim() || settingsStore.detectedClangFormatExecutablePath || undefined,
    })

    if (typeof selected === 'string') {
      clangFormatExecutablePathDraft.value = selected
      void checkClangFormatVersion()
    }
  } catch (error) {
    clangFormatVersionError.value = getErrorMessage(error, t('settings.clangFormat.errors.browseFailed'))
  }
}

function closeModal() {
  if (versionCheckTimeout) {
    clearTimeout(versionCheckTimeout)
    versionCheckTimeout = null
  }

  settingsStore.clangFormatExecutablePath = clangFormatExecutablePathDraft.value.trim()
  emit('close')
}

function handleSettingsEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.open) {
    return
  }

  event.preventDefault()
  closeModal()
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

  if (!props.open) {
    return
  }

  scheduleVersionCheck()
})

watch(themeDraft, (value) => {
  if (!props.open) {
    return
  }

  settingsStore.theme = value
})

watch(localeDraft, (value) => {
  if (!props.open) {
    return
  }

  settingsStore.locale = value
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
          <h3>{{ t('settings.title') }}</h3>
          <p>{{ t('settings.subtitle') }}</p>
        </div>
        <button class="settings-close" @click="closeModal">{{ t('common.actions.close') }}</button>
      </div>

      <div class="settings-content">
        <section class="settings-section">
          <div class="settings-section-title">{{ t('settings.sections.appearance') }}</div>
          <label class="settings-field">
            <span>{{ t('settings.fields.theme') }}</span>
            <select v-model="themeDraft">
              <option value="dark">{{ t('common.theme.dark') }}</option>
              <option value="light">{{ t('common.theme.light') }}</option>
            </select>
          </label>
        </section>

        <section class="settings-section">
          <div class="settings-section-title">{{ t('settings.sections.clangFormat') }}</div>
          <div class="settings-field">
            <span>{{ t('settings.fields.executablePath') }}</span>
            <div class="settings-input-group">
              <input
                v-model="clangFormatExecutablePathDraft"
                class="settings-input"
                type="text"
                :placeholder="clangFormatInputPlaceholder"
              />
              <button type="button" class="settings-browse-button" @click="browseExecutablePath">{{ t('common.actions.browse') }}</button>
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
          <div class="settings-section-title">{{ t('settings.sections.locale') }}</div>
          <label class="settings-field">
            <span>{{ t('settings.fields.interfaceLanguage') }}</span>
            <select v-model="localeDraft">
              <option value="system">{{ t('common.locale.system') }}</option>
              <option value="zh-CN">{{ t('common.locale.zhCN') }}</option>
              <option value="en-US">{{ t('common.locale.enUS') }}</option>
            </select>
          </label>
        </section>
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

@media (max-width: 720px) {
  .settings-content {
    padding: 14px;
  }

  .settings-section {
    padding: 14px;
  }
}
</style>