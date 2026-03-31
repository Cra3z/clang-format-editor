<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getCodeHighlighter, getCodeThemeName, normalizeCodeLanguage } from '@/composables/useCodeHighlighter'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const props = withDefaults(defineProps<{
  modelValue: string
  lang: string
  readOnly?: boolean
  tabSize?: number
}>(), {
  readOnly: false,
  tabSize: 2,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaEl = ref<HTMLTextAreaElement | null>(null)
const highlightInnerEl = ref<HTMLElement | null>(null)
const gutterInnerEl = ref<HTMLElement | null>(null)
const highlightedHtml = ref('<pre><code></code></pre>')

let themeObserver: MutationObserver | null = null

const lineNumbers = computed(() => {
  const lineCount = Math.max(1, props.modelValue.split('\n').length)
  return Array.from({ length: lineCount }, (_, index) => index + 1)
})

async function renderHighlight() {
  try {
    const highlighter = await getCodeHighlighter()
    highlightedHtml.value = highlighter.codeToHtml(props.modelValue || ' ', {
      lang: normalizeCodeLanguage(props.lang),
      theme: getCodeThemeName(),
    })
  } catch {
    highlightedHtml.value = `<pre><code>${escapeHtml(props.modelValue || ' ')}</code></pre>`
  }

  syncScroll()
}

function syncScroll() {
  const textarea = textareaEl.value
  if (!textarea) {
    return
  }

  if (highlightInnerEl.value) {
    highlightInnerEl.value.style.transform = `translate(${-textarea.scrollLeft}px, ${-textarea.scrollTop}px)`
  }

  if (gutterInnerEl.value) {
    gutterInnerEl.value.style.transform = `translateY(${-textarea.scrollTop}px)`
  }
}

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

function handleTab(event: KeyboardEvent) {
  if (props.readOnly) {
    return
  }

  event.preventDefault()
  const textarea = textareaEl.value
  if (!textarea) {
    return
  }

  const indent = ' '.repeat(props.tabSize)
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const nextValue = `${props.modelValue.slice(0, start)}${indent}${props.modelValue.slice(end)}`

  emit('update:modelValue', nextValue)

  requestAnimationFrame(() => {
    if (!textareaEl.value) {
      return
    }

    textareaEl.value.selectionStart = start + indent.length
    textareaEl.value.selectionEnd = start + indent.length
    syncScroll()
  })
}

onMounted(() => {
  renderHighlight()
  themeObserver = new MutationObserver(() => {
    renderHighlight()
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
})

watch(() => props.modelValue, () => {
  renderHighlight()
})

watch(() => props.lang, () => {
  renderHighlight()
})
</script>

<template>
  <div class="rich-editor" :class="{ 'is-readonly': readOnly }">
    <div class="editor-gutter mono" aria-hidden="true">
      <div ref="gutterInnerEl" class="editor-gutter-inner">
        <div
          v-for="lineNumber in lineNumbers"
          :key="lineNumber"
          class="editor-line-number"
        >
          {{ lineNumber }}
        </div>
      </div>
    </div>

    <div class="editor-stage">
      <div class="editor-highlight-backdrop" aria-hidden="true">
        <div ref="highlightInnerEl" class="editor-highlight-inner" v-html="highlightedHtml"></div>
      </div>

      <textarea
        ref="textareaEl"
        class="editor-input mono"
        :value="modelValue"
        :readonly="readOnly"
        spellcheck="false"
        wrap="off"
        :style="{ tabSize: String(tabSize) }"
        @input="onInput"
        @scroll="syncScroll"
        @keydown.tab.prevent="handleTab"
      ></textarea>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rich-editor {
  display: flex;
  height: 100%;
  min-height: 0;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.editor-gutter {
  width: 52px;
  flex: 0 0 52px;
  overflow: hidden;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  color: var(--text-muted);
  user-select: none;
}

.editor-gutter-inner {
  padding: 16px 8px 16px 0;
  will-change: transform;
}

.editor-line-number {
  text-align: right;
  font-size: var(--font-size-sm);
  line-height: 1.7;
}

.editor-stage {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.editor-highlight-backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.editor-highlight-inner {
  position: absolute;
  inset: 0 auto auto 0;
  min-width: 100%;
  will-change: transform;

  :deep(pre) {
    min-height: 100%;
    margin: 0;
    padding: 16px;
    background: transparent !important;
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    line-height: 1.7;
    white-space: pre;
  }

  :deep(code) {
    font-family: var(--font-mono);
  }
}

.editor-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  resize: none;
  overflow: auto;
  border: none;
  border-radius: 0;
  padding: 16px;
  background: transparent;
  color: transparent;
  caret-color: var(--text-primary);
  -webkit-text-fill-color: transparent;
  font-size: var(--font-size-sm);
  line-height: 1.7;
  white-space: pre;
  outline: none;

  &::selection {
    background: color-mix(in srgb, var(--accent) 35%, transparent);
  }

  &:focus {
    border-color: transparent;
  }
}

.is-readonly .editor-input {
  cursor: text;
}
</style>