<script setup lang="ts">
import { ref, watch, onMounted, computed, onBeforeUnmount } from 'vue'
import { useFormatStore } from '@/stores/formatStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Highlighter } from 'shiki'
import { diffLines } from 'diff'
import RichCodeEditor from './RichCodeEditor.vue'
import { sampleCode } from '@/data/sampleCode'
import { getCodeHighlighter, getCodeThemeName, normalizeCodeLanguage, warmupCodeHighlighter } from '@/composables/useCodeHighlighter'

const store = useFormatStore()
const settingsStore = useSettingsStore()
const activeTab = ref<'preview' | 'yaml'>('preview')
const formattedCode = ref(store.previewCode)
const formatError = ref('')
const yamlText = ref(store.yamlOutput)
const yamlError = ref('')
const isEditModalOpen = ref(false)
let highlighter: Highlighter | null = null
let formatTimeout: ReturnType<typeof setTimeout> | null = null

const isTauri = '__TAURI_INTERNALS__' in window

const INNER_SPLITTER_STORAGE_KEY = 'preview-diff-splitter-percent'

const editCode = ref(store.previewCode)

const previewLangOptions = [
  { value: 'cpp', label: 'C / C++', ext: '.cpp' },
  { value: 'csharp', label: 'C#', ext: '.cs' },
  { value: 'java', label: 'Java', ext: '.java' },
  { value: 'javascript', label: 'JavaScript', ext: '.js' },
  { value: 'objective-c', label: 'Objective-C', ext: '.m' },
  { value: 'proto', label: 'Protobuf', ext: '.proto' },
  { value: 'verilog', label: 'Verilog', ext: '.v' },
]

function getAssumeFilename() {
  const match = previewLangOptions.find(o => o.value === store.previewLanguage)
  return match ? `input${match.ext}` : 'input.cpp'
}

function readStoredLeftPanePercent() {
  const stored = Number(localStorage.getItem(INNER_SPLITTER_STORAGE_KEY))
  if (Number.isFinite(stored)) {
    return Math.min(80, Math.max(20, stored))
  }

  return 50
}

// ---- Highlighter ----

async function initHighlighter() {
  highlighter = await getCodeHighlighter()
  updateHighlight()
}

function getShikiTheme() {
  return getCodeThemeName()
}

function getShikiLang() {
  return normalizeCodeLanguage(store.previewLanguage || 'cpp')
}

// ---- Side-by-side diff ----

interface PaneLine {
  num: number | null
  html: string
  type: 'same' | 'added' | 'removed' | 'empty'
}

interface DiffPair { left: PaneLine; right: PaneLine }

function buildSideBySideLines(original: string, formatted: string): DiffPair[] {
  const lang = getShikiLang()
  if (!store.diffHighlightEnabled) {
    const fmtLines = formatted.split('\n')
    const origLines = original.split('\n')
    const maxLen = Math.max(fmtLines.length, origLines.length)
    const result: DiffPair[] = []
    for (let i = 0; i < maxLen; i++) {
      result.push({
        left: {
          num: i < origLines.length ? i + 1 : null,
          html: i < origLines.length ? highlightLine(origLines[i], lang) : '',
          type: 'same',
        },
        right: {
          num: i < fmtLines.length ? i + 1 : null,
          html: i < fmtLines.length ? highlightLine(fmtLines[i], lang) : '',
          type: 'same',
        },
      })
    }
    return result
  }

  const changes = diffLines(original, formatted)
  const result: DiffPair[] = []
  let leftNum = 1
  let rightNum = 1

  let i = 0
  while (i < changes.length) {
    const part = changes[i]
    if (!part.added && !part.removed) {
      const lines = part.value.replace(/\n$/, '').split('\n')
      for (const line of lines) {
        result.push({
          left: { num: leftNum++, html: highlightLine(line, lang), type: 'same' },
          right: { num: rightNum++, html: highlightLine(line, lang), type: 'same' },
        })
      }
      i++
    } else {
      const removedLines: string[] = []
      const addedLines: string[] = []
      while (i < changes.length && (changes[i].added || changes[i].removed)) {
        const lines = changes[i].value.replace(/\n$/, '').split('\n')
        if (changes[i].removed) removedLines.push(...lines)
        else addedLines.push(...lines)
        i++
      }
      const maxPair = Math.max(removedLines.length, addedLines.length)
      for (let j = 0; j < maxPair; j++) {
        const hasLeft = j < removedLines.length
        const hasRight = j < addedLines.length
        result.push({
          left: {
            num: hasLeft ? leftNum++ : null,
            html: hasLeft ? highlightLine(removedLines[j], lang) : '',
            type: hasLeft ? 'removed' : 'empty',
          },
          right: {
            num: hasRight ? rightNum++ : null,
            html: hasRight ? highlightLine(addedLines[j], lang) : '',
            type: hasRight ? 'added' : 'empty',
          },
        })
      }
    }
  }
  return result
}

function highlightLine(line: string, lang: string): string {
  if (!highlighter) return escapeHtml(line)
  try {
    const html = highlighter.codeToHtml(line || ' ', { lang, theme: getShikiTheme() })
    const match = html.match(/<code[^>]*>([\s\S]*)<\/code>/)
    return match ? match[1] : escapeHtml(line)
  } catch {
    return escapeHtml(line)
  }
}

const diffPairs = ref<DiffPair[]>([])

function updateHighlight() {
  diffPairs.value = buildSideBySideLines(store.previewCode, formattedCode.value)
}

// ---- Format via Tauri ----

async function formatWithClangFormat() {
  if (!isTauri) {
    formattedCode.value = store.previewCode
    formatError.value = ''
    updateHighlight()
    return
  }
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const yamlConfig = store.yamlOutput
    const style = `{${yamlConfig.replace(/\n/g, ', ')}}`
    const executablePath = settingsStore.effectiveClangFormatExecutablePath.trim()
    const result = await invoke<string>('format_code', {
      code: store.previewCode,
      style,
      assumeFilename: getAssumeFilename(),
      executablePath: executablePath || undefined,
    })
    formattedCode.value = result
    formatError.value = ''
  } catch (e: unknown) {
    formatError.value = String(e)
    formattedCode.value = store.previewCode
  }
  updateHighlight()
}

// ---- Editing ----

function openEditModal() {
  editCode.value = store.previewCode
  isEditModalOpen.value = true
}

const hasEditDraftChanges = computed(() => editCode.value !== store.previewCode)

function discardEditDraft() {
  editCode.value = store.previewCode
  isEditModalOpen.value = false
}

function requestCloseEditModal() {
  if (hasEditDraftChanges.value && !window.confirm('当前代码有未保存改动，确认放弃吗？')) {
    return
  }

  discardEditDraft()
}

function handleEditModalEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !isEditModalOpen.value) {
    return
  }

  event.preventDefault()
  requestCloseEditModal()
}

function applyEdit() {
  store.previewCode = editCode.value
  isEditModalOpen.value = false
  scheduleFormat()
}

function resetEditDraft() {
  editCode.value = sampleCode
}

function applyYamlEdit() {
  const ok = store.importYaml(yamlText.value)
  if (!ok) {
    yamlError.value = 'YAML 解析失败，请检查缩进和字段格式。'
    return
  }

  yamlText.value = store.yamlOutput
  yamlError.value = ''
  activeTab.value = 'preview'
}

async function copyYamlText() {
  await navigator.clipboard.writeText(yamlText.value)
}

function scheduleFormat() {
  if (formatTimeout) clearTimeout(formatTimeout)
  formatTimeout = setTimeout(() => {
    formatWithClangFormat()
  }, 500)
}

// ---- Splitter drag ----

const leftPanePercent = ref(readStoredLeftPanePercent())
const isDragging = ref(false)
const splitContainer = ref<HTMLElement | null>(null)

function onSplitterDown(e: PointerEvent) {
  isDragging.value = true
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function onSplitterMove(e: PointerEvent) {
  if (!isDragging.value || !splitContainer.value) return
  const rect = splitContainer.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const pct = Math.min(80, Math.max(20, (x / rect.width) * 100))
  leftPanePercent.value = pct
}

function onSplitterUp() {
  isDragging.value = false
}

// ---- Synchronized scrolling ----

const leftScrollEl = ref<HTMLElement | null>(null)
const rightScrollEl = ref<HTMLElement | null>(null)
let scrollingSide: 'left' | 'right' | null = null

function onLeftScroll() {
  if (scrollingSide === 'right') return
  scrollingSide = 'left'
  if (leftScrollEl.value && rightScrollEl.value) {
    rightScrollEl.value.scrollTop = leftScrollEl.value.scrollTop
  }
  requestAnimationFrame(() => { scrollingSide = null })
}

function onRightScroll() {
  if (scrollingSide === 'left') return
  scrollingSide = 'right'
  if (leftScrollEl.value && rightScrollEl.value) {
    leftScrollEl.value.scrollTop = rightScrollEl.value.scrollTop
  }
  requestAnimationFrame(() => { scrollingSide = null })
}

// ---- Lifecycle & watchers ----

onMounted(() => {
  warmupCodeHighlighter()
  initHighlighter()
  formatWithClangFormat()
})

watch(leftPanePercent, (value) => {
  localStorage.setItem(INNER_SPLITTER_STORAGE_KEY, String(value))
})

watch(() => store.yamlOutput, () => {
  yamlText.value = store.yamlOutput
  yamlError.value = ''
  scheduleFormat()
})

watch(() => store.previewCode, (val) => {
  editCode.value = val
  scheduleFormat()
})

watch(() => store.diffHighlightEnabled, () => {
  updateHighlight()
})

watch(() => store.previewLanguage, () => {
  updateHighlight()
  scheduleFormat()
})

watch(() => settingsStore.clangFormatExecutablePath, () => {
  scheduleFormat()
})

watch(() => settingsStore.detectedClangFormatExecutablePath, () => {
  scheduleFormat()
})

watch(isEditModalOpen, (open) => {
  window.removeEventListener('keydown', handleEditModalEscape)

  if (open) {
    window.addEventListener('keydown', handleEditModalEscape)
  }
})

const themeObserver = new MutationObserver(() => updateHighlight())
onMounted(() => {
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEditModalEscape)
  themeObserver.disconnect()
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
</script>

<template>
  <div class="code-preview">
    <div class="preview-tabs">
      <div class="tabs-left">
        <button
          :class="{ active: activeTab === 'preview' }"
          @click="activeTab = 'preview'"
        >
          代码预览
        </button>
        <button
          :class="{ active: activeTab === 'yaml' }"
          @click="activeTab = 'yaml'"
        >
          .clang-format
        </button>
      </div>
    </div>

    <div class="preview-body">
      <!-- Preview tab: side-by-side with draggable splitter -->
      <template v-if="activeTab === 'preview'">
        <div v-if="formatError" class="format-error">
          <span class="error-icon">⚠</span> {{ formatError }}
        </div>
        <div
          ref="splitContainer"
          class="split-container"
          :class="{ 'is-dragging': isDragging }"
        >
          <!-- Left pane -->
          <div class="split-pane" :style="{ width: leftPanePercent + '%' }">
            <div class="pane-header">
              <span class="pane-header-title">原始代码</span>
              <div class="pane-header-actions">
                <button class="pane-header-button" @click="openEditModal">编辑</button>
              </div>
            </div>
            <div ref="leftScrollEl" class="pane-scroll mono" @scroll="onLeftScroll">
              <div
                v-for="(pair, idx) in diffPairs"
                :key="'l' + idx"
                class="diff-row"
                :class="`dt-${pair.left.type}`"
              >
                <span class="diff-gutter">
                  <span class="diff-marker" v-if="pair.left.type === 'removed'">−</span>
                </span>
                <span class="diff-num">{{ pair.left.num ?? '' }}</span>
                <span class="diff-code" v-html="pair.left.html"></span>
              </div>
            </div>
          </div>

          <!-- Splitter handle -->
          <div
            class="splitter"
            @pointerdown.prevent="onSplitterDown"
            @pointermove="onSplitterMove"
            @pointerup="onSplitterUp"
            @pointercancel="onSplitterUp"
          ></div>

          <!-- Right pane -->
          <div class="split-pane" :style="{ width: (100 - leftPanePercent) + '%' }">
            <div class="pane-header">
              <span class="pane-header-title">格式化后</span>
              <div class="pane-header-actions">
                <label class="diff-toggle diff-toggle-inline">
                  <input type="checkbox" v-model="store.diffHighlightEnabled" />
                  <span>显示差异</span>
                </label>
              </div>
            </div>
            <div ref="rightScrollEl" class="pane-scroll mono" @scroll="onRightScroll">
              <div
                v-for="(pair, idx) in diffPairs"
                :key="'r' + idx"
                class="diff-row"
                :class="`dt-${pair.right.type}`"
              >
                <span class="diff-gutter">
                  <span class="diff-marker" v-if="pair.right.type === 'added'">+</span>
                </span>
                <span class="diff-num">{{ pair.right.num ?? '' }}</span>
                <span class="diff-code" v-html="pair.right.html"></span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- YAML tab -->
      <div
        v-else-if="activeTab === 'yaml'"
        class="yaml-panel"
        @keydown.ctrl.enter.prevent="applyYamlEdit"
      >
        <div class="yaml-toolbar">
          <span class="yaml-toolbar-title">.clang-format</span>
          <div class="yaml-toolbar-spacer"></div>
          <button class="copy-button" @click="copyYamlText">复制</button>
          <button class="primary" @click="applyYamlEdit">应用</button>
        </div>
        <div v-if="yamlError" class="yaml-error">{{ yamlError }}</div>
        <RichCodeEditor
          v-model="yamlText"
          class="yaml-editor"
          lang="yaml"
          :tab-size="2"
        />
      </div>
    </div>

    <div
      v-show="isEditModalOpen"
      class="edit-modal-overlay"
    >
      <div class="edit-modal" @keydown.ctrl.enter.prevent="applyEdit">
        <div class="edit-modal-header">
          <div>
            <div class="edit-modal-title">编辑原始代码</div>
            <div class="edit-modal-subtitle">修改左侧原始代码，应用后会重新格式化并更新差异。</div>
          </div>
          <button class="edit-modal-close" @click="requestCloseEditModal">关闭</button>
        </div>

        <div class="edit-modal-toolbar">
          <button class="primary" @click="applyEdit">应用</button>
          <button @click="resetEditDraft">还原默认示例</button>
          <div class="edit-toolbar-spacer"></div>
          <label class="lang-selector">
            <span>语言:</span>
            <select v-model="store.previewLanguage">
              <option v-for="opt in previewLangOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </label>
        </div>

        <div class="edit-modal-body">
          <RichCodeEditor
            v-model="editCode"
            class="edit-code-editor"
            :lang="store.previewLanguage"
            :tab-size="4"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.code-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-tabs {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;

  button {
    padding: 8px 16px;
    font-size: var(--font-size-sm);
    background: transparent;
    color: var(--text-secondary);
    border-radius: 0;
    border-bottom: 2px solid transparent;
    transition: all var(--transition-fast);
    flex-shrink: 0;
    white-space: nowrap;

    &:hover {
      color: var(--text-primary);
      background: var(--bg-hover);
    }

    &.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
  }

}

.tabs-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.diff-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    cursor: pointer;
    accent-color: var(--accent);
  }
}

.diff-toggle-inline {
  flex: 0 0 auto;
  white-space: nowrap;
}

.preview-body {
  flex: 1;
  overflow: hidden;
  background: var(--bg-tertiary);
}

/* ---- Split container ---- */

.split-container {
  display: flex;
  height: 100%;

  &.is-dragging {
    cursor: col-resize;
    user-select: none;
  }
}

.split-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.pane-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 12px;
  min-height: 36px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.pane-header-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pane-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.pane-header-button {
  padding: 4px 10px;
  font-size: var(--font-size-xs);
}

.pane-scroll {
  flex: 1;
  overflow: auto;
  font-size: var(--font-size-sm);
  line-height: 1.7;
}

.splitter {
  width: 5px;
  flex-shrink: 0;
  background: var(--border-color);
  cursor: col-resize;
  position: relative;
  z-index: 3;
  transition: background var(--transition-fast);

  &:hover,
  .is-dragging & {
    background: var(--accent);
  }
}

/* ---- Diff rows ---- */

.diff-row {
  display: flex;
  align-items: stretch;
  min-height: 1.7em;

  &.dt-removed {
    background: var(--diff-removed-bg);

    .diff-gutter {
      border-left: 3px solid var(--diff-removed-border);
    }
  }

  &.dt-added {
    background: var(--diff-added-bg);

    .diff-gutter {
      border-left: 3px solid var(--diff-added-border);
    }
  }

  &.dt-same .diff-gutter,
  &.dt-empty .diff-gutter {
    border-left: 3px solid transparent;
  }

  &.dt-empty {
    background: var(--diff-placeholder-bg);
  }
}

.diff-gutter {
  width: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.diff-marker {
  font-weight: 700;
  font-size: 11px;

  .dt-removed & {
    color: var(--error);
  }

  .dt-added & {
    color: var(--success);
  }
}

.diff-num {
  width: 32px;
  flex-shrink: 0;
  text-align: right;
  padding-right: 6px;
  color: var(--text-muted);
  user-select: none;
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.diff-code {
  flex: 1;
  min-width: 0;
  white-space: pre;
  padding: 0 8px 0 4px;
  font-family: var(--font-mono);

  :deep(span) {
    font-family: var(--font-mono);
  }
}

/* ---- YAML panel ---- */

.yaml-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.yaml-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.yaml-toolbar-spacer {
  flex: 1;
}

.yaml-toolbar-title {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.copy-button {
  transition: background-color var(--transition-fast), box-shadow var(--transition-fast), filter var(--transition-fast);

  &:hover {
    background: color-mix(in srgb, var(--accent) 18%, var(--bg-surface));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent);
    filter: brightness(1.06);
  }
}

.yaml-error {
  padding: 8px 12px;
  background: color-mix(in srgb, var(--error) 12%, transparent);
  color: var(--error);
  border-bottom: 1px solid color-mix(in srgb, var(--error) 25%, var(--border-color));
  font-size: var(--font-size-xs);
}

.yaml-editor {
  flex: 1;
  min-height: 0;
}

.format-error {
  padding: 8px 16px;
  background: var(--error);
  color: var(--bg-primary);
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  gap: 6px;

  .error-icon {
    font-size: 14px;
  }
}

/* ---- Edit modal ---- */

.edit-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(0 0 0 / 0.52);
  backdrop-filter: blur(6px);
}

.edit-modal {
  display: flex;
  flex-direction: column;
  width: min(980px, calc(100vw - 48px));
  height: min(760px, calc(100vh - 48px));
  min-height: 420px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 24px 80px rgb(0 0 0 / 0.4);
  overflow: hidden;
}

.edit-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.edit-modal-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.edit-modal-subtitle {
  margin-top: 4px;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.edit-modal-close {
  flex-shrink: 0;
}

.edit-modal-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  align-items: center;
}

.edit-modal-body {
  flex: 1;
  min-height: 0;
}

.edit-toolbar-spacer {
  flex: 1;
}

.lang-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);

  select {
    min-width: 110px;
    font-size: var(--font-size-xs);
  }
}

.edit-code-editor {
  flex: 1;
  height: 100%;
  min-height: 0;
}
</style>
