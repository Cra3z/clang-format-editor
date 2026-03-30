import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as yaml from 'js-yaml'
import type { ClangFormatConfig, BasedOnStyle } from '@/types/clangFormat'
import { getPresetDefaults } from '@/data/presets'

export const useFormatStore = defineStore('format', () => {
  const config = ref<ClangFormatConfig>({
    BasedOnStyle: 'LLVM',
    Language: 'Cpp',
  })

  const activePreset = ref<BasedOnStyle>('LLVM')

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
    } catch (e) {
      console.error('Failed to parse YAML:', e)
    }
  }

  /** 重置为预设默认值 */
  function resetToPreset() {
    setPreset(activePreset.value)
  }

  return {
    config,
    activePreset,
    setPreset,
    setOption,
    getOption,
    yamlOutput,
    importYaml,
    resetToPreset,
  }
})
