<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView, keymap, placeholder, drawSelection, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { yaml } from '@codemirror/lang-yaml'
import { acceptCompletion, autocompletion, closeBrackets, completionKeymap, type Completion, type CompletionContext } from '@codemirror/autocomplete'
import { linter, lintGutter, type Diagnostic } from '@codemirror/lint'
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { getCompletionFieldsForPath, getSchemaValueMeta } from '@/lib/clangFormatSchema'
import { validateClangFormatYaml } from '@/lib/clangFormatValidation'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const hostEl = ref<HTMLDivElement | null>(null)
let view: EditorView | null = null

const vitesseHighlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: 'var(--code-token-comment)' },
  {
    tag: [tags.bracket, tags.paren, tags.squareBracket, tags.brace, tags.separator, tags.punctuation],
    color: 'var(--code-token-punctuation)',
  },
  {
    tag: [tags.keyword, tags.operatorKeyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword],
    color: 'var(--code-token-keyword)',
  },
  {
    tag: [tags.atom, tags.bool, tags.null],
    color: 'var(--code-token-storage)',
  },
  {
    tag: [tags.string, tags.special(tags.string), tags.escape],
    color: 'var(--code-token-string)',
  },
  {
    tag: [tags.number, tags.integer, tags.float],
    color: 'var(--code-token-number)',
  },
  {
    tag: [tags.propertyName, tags.labelName, tags.definition(tags.propertyName)],
    color: 'var(--code-token-property)',
  },
  {
    tag: tags.typeName,
    color: 'var(--code-token-type)',
  },
  {
    tag: tags.namespace,
    color: 'var(--code-token-namespace)',
  },
  {
    tag: tags.className,
    color: 'var(--code-token-class)',
  },
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName), tags.name],
    color: 'var(--code-token-entity)',
  },
])

function getLineContext(doc: string, pos: number) {
  const lineStart = doc.lastIndexOf('\n', pos - 1) + 1
  const lineEndIndex = doc.indexOf('\n', pos)
  const lineEnd = lineEndIndex === -1 ? doc.length : lineEndIndex
  const lineText = doc.slice(lineStart, lineEnd)
  return { lineStart, lineEnd, lineText }
}

function getIndentWidth(line: string) {
  return line.match(/^\s*/)?.[0].length ?? 0
}

function getParentPath(doc: string, currentLineStart: number, currentIndent: number) {
  const lines = doc.slice(0, currentLineStart).split('\n')
  const stack: Array<{ indent: number; key: string }> = []

  for (const line of lines) {
    if (!line.trim() || /^\s*#/.test(line) || /^\s*---\s*$/.test(line)) {
      continue
    }

    const match = line.match(/^(\s*)([A-Za-z][A-Za-z0-9]*):(.*)$/)
    if (!match) {
      continue
    }

    const indent = match[1].length
    const key = match[2]
    const remainder = match[3].trim()

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }

    if (!remainder || remainder.startsWith('#')) {
      stack.push({ indent, key })
    }
  }

  while (stack.length > 0 && stack[stack.length - 1].indent >= currentIndent) {
    stack.pop()
  }

  return stack.map(entry => entry.key)
}

function createFieldCompletion(path: string[], fieldKey: string, indent: number, description?: string) {
  const meta = getSchemaValueMeta([...path, fieldKey])
  const applyText = meta.acceptsObject ? `${fieldKey}:\n${' '.repeat(indent + 2)}` : `${fieldKey}: `

  return {
    apply: applyText,
    detail: meta.acceptsObject
      ? 'object'
      : meta.values.length > 0
        ? 'enum'
        : meta.acceptsBoolean
          ? 'boolean'
          : meta.acceptsInteger
            ? 'integer'
            : meta.acceptsNumber
              ? 'number'
              : 'field',
    info: description ?? meta.description,
    label: fieldKey,
    type: 'property',
  } satisfies Completion
}

function yamlCompletionSource(context: CompletionContext) {
  const doc = context.state.doc.toString()
  const pos = context.pos
  const { lineStart, lineText } = getLineContext(doc, pos)
  const beforeCursor = doc.slice(lineStart, pos)
  const currentIndent = getIndentWidth(lineText)
  const parentPath = getParentPath(doc, lineStart, currentIndent)

  if (/^\s*#/.test(lineText) || /^\s*---\s*$/.test(lineText)) {
    return null
  }

  const valueMatch = beforeCursor.match(/^(\s*)([A-Za-z][A-Za-z0-9]*):\s*([^#]*)$/)
  if (valueMatch) {
    const fieldPath = [...parentPath, valueMatch[2]]
    const meta = getSchemaValueMeta(fieldPath)

    const valueToken = valueMatch[3].trimStart()
    const tokenOffset = beforeCursor.length - valueToken.length
    const from = lineStart + tokenOffset
    const options: Completion[] = []

    if (meta.acceptsBoolean) {
      options.push(
        { label: 'true', type: 'constant', detail: 'boolean' },
        { label: 'false', type: 'constant', detail: 'boolean' },
      )
    }

    if (meta.values.length > 0) {
      options.push(
        ...meta.values.map(value => ({
          label: value,
          type: 'enum',
          detail: valueMatch[2],
        })),
      )
    }

    if (!options.length) {
      return null
    }

    return {
      from,
      options,
      validFor: /^[A-Za-z0-9+_-]*$/,
    }
  }

  const keyMatch = beforeCursor.match(/^(\s*)([A-Za-z][A-Za-z0-9]*)?$/)
  if (!keyMatch) {
    return null
  }

  const keyToken = keyMatch[2] ?? ''
  const from = pos - keyToken.length
  const options = getCompletionFieldsForPath(parentPath)
    .map(field => createFieldCompletion(parentPath, field.key, currentIndent, field.description))

  return {
    from,
    options,
    validFor: /^[A-Za-z0-9]*$/,
  }
}

function createDiagnostics(docText: string): Diagnostic[] {
  return validateClangFormatYaml(docText).diagnostics.map(diagnostic => ({
    from: diagnostic.from,
    message: diagnostic.message,
    severity: diagnostic.severity,
    to: diagnostic.to,
  }))
}

function buildThemeExtension() {
  return EditorView.theme({
    '&': {
      height: '100%',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--font-size-sm)',
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
    },
    '.cm-editor': {
      height: '100%',
    },
    '.cm-scroller': {
      fontFamily: 'var(--font-mono)',
      lineHeight: '1.7',
    },
    '.cm-content': {
      caretColor: 'var(--text-primary)',
      padding: '16px 0',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--text-primary)',
      borderLeftWidth: '2px',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-muted)',
      borderRight: '1px solid var(--border-color)',
    },
    '.cm-activeLine': {
      backgroundColor: 'color-mix(in srgb, var(--accent-dim) 35%, transparent)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'color-mix(in srgb, var(--accent-dim) 35%, transparent)',
    },
    '.cm-tooltip': {
      border: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--font-size-sm)',
    },
    '.cm-tooltip-autocomplete > ul': {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--font-size-sm)',
    },
    '.cm-tooltip-autocomplete > ul > li': {
      lineHeight: '1.6',
    },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      backgroundColor: 'color-mix(in srgb, var(--accent) 22%, var(--bg-surface))',
      color: 'var(--text-primary)',
    },
    '.cm-completionLabel': {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--font-size-sm)',
    },
    '.cm-completionDetail': {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--font-size-sm)',
      opacity: '0.65',
      fontStyle: 'normal',
    },
    '.cm-completionInfo': {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--font-size-sm)',
      lineHeight: '1.6',
      padding: '6px 10px',
      maxWidth: '360px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    '.cm-completionIcon': {
      opacity: '0.7',
    },
    '.cm-diagnostic': {
      borderLeft: '3px solid var(--error)',
    },
    '.cm-diagnostic-error': {
      backgroundColor: 'color-mix(in srgb, var(--error) 12%, transparent)',
    },
    '.cm-lintRange-error': {
      backgroundImage: 'linear-gradient(to bottom, transparent 65%, var(--error) 65%, var(--error) 75%, transparent 75%)',
    },
    '.cm-tooltip-lint': {
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-primary)',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'var(--bg-hover)',
      border: 'none',
      color: 'var(--text-secondary)',
    },
  })
}

function createExtensions(): Extension[] {
  return [
    history(),
    drawSelection(),
    highlightActiveLine(),
    bracketMatching(),
    closeBrackets(),
    indentOnInput(),
    foldGutter(),
    lintGutter(),
    yaml(),
    syntaxHighlighting(vitesseHighlightStyle),
    autocompletion({
      override: [yamlCompletionSource],
      activateOnTyping: true,
      defaultKeymap: false,
    }),
    linter((view) => createDiagnostics(view.state.doc.toString())),
    keymap.of([
      { key: 'Tab', run: acceptCompletion },
      ...completionKeymap,
      ...defaultKeymap,
      ...historyKeymap,
    ]),
    placeholder('.clang-format'),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        emit('update:modelValue', update.state.doc.toString())
      }
    }),
    buildThemeExtension(),
  ]
}

function createEditor() {
  if (!hostEl.value) {
    return
  }

  view?.destroy()
  view = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: createExtensions(),
    }),
    parent: hostEl.value,
  })
}

function syncExternalValue(value: string) {
  if (!view) {
    return
  }

  const current = view.state.doc.toString()
  if (current === value) {
    return
  }

  view.dispatch({
    changes: { from: 0, to: current.length, insert: value },
  })
}

onMounted(() => {
  createEditor()
})

onBeforeUnmount(() => {
  view?.destroy()
  view = null
})

watch(() => props.modelValue, (value) => {
  syncExternalValue(value)
})
</script>

<template>
  <div ref="hostEl" class="clang-format-yaml-editor"></div>
</template>

<style scoped lang="scss">
.clang-format-yaml-editor {
  height: 100%;
  min-height: 0;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.clang-format-yaml-editor :deep(.cm-editor) {
  height: 100%;
}

.clang-format-yaml-editor :deep(.cm-scroller) {
  overflow: auto;
}

.clang-format-yaml-editor :deep(.cm-panels) {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}
</style>
