<script setup lang="ts">
import { ref, watch, onMounted, computed, onBeforeUnmount } from 'vue'
import { useFormatStore } from '@/stores/formatStore'
import { createHighlighter, type Highlighter } from 'shiki'
import { diffLines } from 'diff'

const store = useFormatStore()
const activeTab = ref<'preview' | 'yaml' | 'edit'>('preview')
const highlightedYaml = ref('')
const formattedCode = ref(store.previewCode)
const formatError = ref('')
let highlighter: Highlighter | null = null
let formatTimeout: ReturnType<typeof setTimeout> | null = null

const isTauri = '__TAURI_INTERNALS__' in window

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

// ---- Highlighter ----

async function initHighlighter() {
  highlighter = await createHighlighter({
    themes: ['vitesse-dark', 'vitesse-light'],
    langs: ['cpp', 'yaml', 'csharp', 'java', 'javascript', 'objective-c', 'proto', 'verilog'],
  })
  updateHighlight()
}

function getShikiTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'vitesse-light' : 'vitesse-dark'
}

function getShikiLang() {
  return store.previewLanguage || 'cpp'
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
  if (highlighter) {
    highlightedYaml.value = highlighter.codeToHtml(store.yamlOutput, { lang: 'yaml', theme: getShikiTheme() })
  } else {
    highlightedYaml.value = `<pre><code>${escapeHtml(store.yamlOutput)}</code></pre>`
  }
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
    const result = await invoke<string>('format_code', {
      code: store.previewCode,
      style,
      assumeFilename: getAssumeFilename(),
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

function applyEdit() {
  store.previewCode = editCode.value
  activeTab.value = 'preview'
  scheduleFormat()
}

function resetEdit() {
  store.resetPreviewCode()
  editCode.value = store.previewCode
}

function scheduleFormat() {
  if (formatTimeout) clearTimeout(formatTimeout)
  formatTimeout = setTimeout(() => {
    formatWithClangFormat()
  }, 500)
}

// ---- Splitter drag ----

const leftPanePercent = ref(50)
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
  initHighlighter()
  formatWithClangFormat()
})

watch(() => store.yamlOutput, () => {
  scheduleFormat()
  if (highlighter) {
    highlightedYaml.value = highlighter.codeToHtml(store.yamlOutput, { lang: 'yaml', theme: getShikiTheme() })
  }
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

const themeObserver = new MutationObserver(() => updateHighlight())
onMounted(() => {
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
onBeforeUnmount(() => {
  themeObserver.disconnect()
})

const showDiffToggle = computed(() => activeTab.value === 'preview')

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
      <button
        :class="{ active: activeTab === 'edit' }"
        @click="activeTab = 'edit'"
      >
        编辑代码
      </button>

      <div class="tabs-right" v-if="showDiffToggle">
        <label class="diff-toggle">
          <input type="checkbox" v-model="store.diffHighlightEnabled" />
          <span>显示差异</span>
        </label>
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
            <div class="pane-header">原始代码</div>
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
            <div class="pane-header">格式化后</div>
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
      <div v-else-if="activeTab === 'yaml'" class="code-block" v-html="highlightedYaml"></div>

      <!-- Edit tab -->
      <div v-else class="edit-panel">
        <div class="edit-toolbar">
          <button class="primary" @click="applyEdit">✓ 应用</button>
          <button @click="resetEdit">↺ 还原默认</button>
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
        <textarea
          v-model="editCode"
          class="edit-textarea mono"
          spellcheck="false"
          @keydown.ctrl.enter.prevent="applyEdit"
        ></textarea>
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

    &:hover {
      color: var(--text-primary);
      background: var(--bg-hover);
    }

    &.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
  }

  .tabs-right {
    margin-left: auto;
    padding-right: 12px;
  }
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
  padding: 4px 12px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
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

/* ---- YAML code block ---- */

.code-block {
  padding: 0;
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: 1.7;
  color: var(--text-primary);
  height: 100%;
  overflow: auto;

  :deep(pre) {
    padding: 16px;
    margin: 0;
    background: transparent !important;
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    line-height: 1.7;
  }

  :deep(code) {
    font-family: var(--font-mono);
  }
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

/* ---- Edit panel ---- */

.edit-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.edit-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  align-items: center;
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

.edit-textarea {
  flex: 1;
  resize: none;
  border: none;
  border-radius: 0;
  padding: 16px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  line-height: 1.7;
  tab-size: 4;
  outline: none;

  &:focus {
    border-color: transparent;
  }
}
</style>
