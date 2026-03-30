<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useFormatStore } from '@/stores/formatStore'
import { sampleCode } from '@/data/sampleCode'
import { createHighlighter, type Highlighter } from 'shiki'

const store = useFormatStore()
const activeTab = ref<'preview' | 'yaml'>('preview')
const highlightedCode = ref('')
const highlightedYaml = ref('')
const formattedCode = ref(sampleCode)
const formatError = ref('')
let highlighter: Highlighter | null = null
let formatTimeout: ReturnType<typeof setTimeout> | null = null

// Check if we're inside Tauri
const isTauri = '__TAURI__' in window

async function initHighlighter() {
  highlighter = await createHighlighter({
    themes: ['vitesse-dark', 'vitesse-light'],
    langs: ['cpp', 'yaml'],
  })
  updateHighlight()
}

function getShikiTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'vitesse-light' : 'vitesse-dark'
}

function updateHighlight() {
  if (!highlighter) {
    highlightedCode.value = `<pre><code>${escapeHtml(formattedCode.value)}</code></pre>`
    highlightedYaml.value = `<pre><code>${escapeHtml(store.yamlOutput)}</code></pre>`
    return
  }
  const theme = getShikiTheme()
  highlightedCode.value = highlighter.codeToHtml(formattedCode.value, { lang: 'cpp', theme })
  highlightedYaml.value = highlighter.codeToHtml(store.yamlOutput, { lang: 'yaml', theme })
}

async function formatWithClangFormat() {
  if (!isTauri) {
    formattedCode.value = sampleCode
    formatError.value = ''
    updateHighlight()
    return
  }
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const yamlConfig = store.yamlOutput
    const style = `{${yamlConfig.replace(/\n/g, ', ')}}`
    const result = await invoke<string>('format_code', {
      code: sampleCode,
      style,
    })
    formattedCode.value = result
    formatError.value = ''
  } catch (e: any) {
    formatError.value = String(e)
    formattedCode.value = sampleCode
  }
  updateHighlight()
}

onMounted(() => {
  initHighlighter()
  formatWithClangFormat()
})

watch(() => store.yamlOutput, () => {
  // Debounce format calls
  if (formatTimeout) clearTimeout(formatTimeout)
  formatTimeout = setTimeout(() => {
    formatWithClangFormat()
  }, 500)
  // Update YAML highlight immediately
  if (highlighter) {
    highlightedYaml.value = highlighter.codeToHtml(store.yamlOutput, { lang: 'yaml', theme: getShikiTheme() })
  }
})

// Watch for theme changes
const observer = new MutationObserver(() => updateHighlight())
onMounted(() => {
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
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

    <div class="preview-body">
      <div v-if="formatError && activeTab === 'preview'" class="format-error">
        <span class="error-icon">⚠</span> {{ formatError }}
      </div>
      <div v-if="activeTab === 'preview'" class="code-block" v-html="highlightedCode"></div>
      <div v-else class="code-block" v-html="highlightedYaml"></div>
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
}

.preview-body {
  flex: 1;
  overflow: auto;
  background: var(--bg-tertiary);
}

.code-block {
  padding: 0;
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: 1.7;
  color: var(--text-primary);

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
</style>
