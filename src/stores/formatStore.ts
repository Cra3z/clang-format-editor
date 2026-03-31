import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import * as yaml from 'js-yaml'
import type { ClangFormatConfig, BasedOnStyle } from '@/types/clangFormat'
import { getPresetDefaults } from '@/data/presets'
import { sampleCode } from '@/data/sampleCode'

const PREVIEW_CODE_STORAGE_KEY = 'preview-code'
const DIFF_HIGHLIGHT_STORAGE_KEY = 'preview-diff-highlight'
const PREVIEW_LANG_STORAGE_KEY = 'preview-language'

function readStoredPreviewCode() {
  return localStorage.getItem(PREVIEW_CODE_STORAGE_KEY) ?? sampleCode
}

function readStoredDiffHighlight() {
  return localStorage.getItem(DIFF_HIGHLIGHT_STORAGE_KEY) !== 'false'
}

function readStoredPreviewLang() {
  return localStorage.getItem(PREVIEW_LANG_STORAGE_KEY) ?? 'cpp'
}

export const useFormatStore = defineStore('format', () => {
  const config = ref<ClangFormatConfig>({
    BasedOnStyle: 'LLVM',
    Language: 'Cpp',
  })

  const activePreset = ref<BasedOnStyle>('LLVM')
  const previewCode = ref(readStoredPreviewCode())
  const diffHighlightEnabled = ref(readStoredDiffHighlight())
  const previewLanguage = ref(readStoredPreviewLang())

  watch(previewCode, (value) => {
    localStorage.setItem(PREVIEW_CODE_STORAGE_KEY, value)
  })

  watch(diffHighlightEnabled, (value) => {
    localStorage.setItem(DIFF_HIGHLIGHT_STORAGE_KEY, String(value))
  })

  watch(previewLanguage, (value) => {
    localStorage.setItem(PREVIEW_LANG_STORAGE_KEY, value)
  })

  function setPreset(preset: BasedOnStyle) {
    activePreset.value = preset
    const defaults = getPresetDefaults(preset)
    config.value = { ...defaults, BasedOnStyle: preset, Language: config.value.Language }
  }

  function setOption<K extends keyof ClangFormatConfig>(key: K, value: ClangFormatConfig[K]) {
    config.value = { ...config.value, [key]: value }
  }

  function getOption<K extends keyof ClangFormatConfig>(key: K): ClangFormatConfig[K] {
    return config.value[key]
  }

  /** 导出 YAML 格式的 .clang-format 内容 */
  const yamlOutput = computed(() => {
    const output: Record<string, unknown> = {}
    const defaults = getPresetDefaults(activePreset.value)

    // 始终输出 BasedOnStyle
    if (config.value.BasedOnStyle) {
      output['BasedOnStyle'] = config.value.BasedOnStyle
    }

    // 只输出与预设不同的选项
    for (const [key, value] of Object.entries(config.value)) {
      if (key === 'BasedOnStyle') continue
      if (value === undefined || value === null) continue

      const defaultVal = defaults[key as keyof ClangFormatConfig]
      if (JSON.stringify(value) !== JSON.stringify(defaultVal)) {
        output[key] = value
      }
    }

    return yaml.dump(output, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    }).replace(/^---\n/, '')
  })

  /** 从 YAML 导入配置 */
  function importYaml(yamlStr: string) {
    try {
      const parsed = yaml.load(yamlStr) as ClangFormatConfig
      if (parsed && typeof parsed === 'object') {
        if (parsed.BasedOnStyle) {
          activePreset.value = parsed.BasedOnStyle
        }
        config.value = { ...getPresetDefaults(activePreset.value), ...parsed }
      }
      return true
    } catch (e) {
      console.error('Failed to parse YAML:', e)
      return false
    }
  }

  /** 重置为预设默认值 */
  function resetToPreset() {
    setPreset(activePreset.value)
  }

  function resetPreviewCode() {
    previewCode.value = sampleCode
  }

  return {
    config,
    activePreset,
    previewCode,
    diffHighlightEnabled,
    previewLanguage,
    setPreset,
    setOption,
    getOption,
    yamlOutput,
    importYaml,
    resetToPreset,
    resetPreviewCode,
  }
})
