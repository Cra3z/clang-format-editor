import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type AppTheme = 'dark' | 'light'
export type AppLocale = 'system' | 'zh-CN' | 'en-US'

interface ClangFormatInspection {
  version: string
  resolvedPath: string
}

const THEME_STORAGE_KEY = 'theme'
const CLANG_FORMAT_EXECUTABLE_PATH_STORAGE_KEY = 'clang-format-executable-path'
const APP_LOCALE_STORAGE_KEY = 'app-locale'

function readStoredTheme(): AppTheme {
  return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

function readStoredClangFormatExecutablePath() {
  return localStorage.getItem(CLANG_FORMAT_EXECUTABLE_PATH_STORAGE_KEY) ?? ''
}

function readStoredLocale(): AppLocale {
  const stored = localStorage.getItem(APP_LOCALE_STORAGE_KEY)
  if (stored === 'zh-CN' || stored === 'en-US') {
    return stored
  }

  return 'system'
}

function applyTheme(theme: AppTheme) {
  document.documentElement.setAttribute('data-theme', theme)
}

function getDetectionCandidates() {
  return Array.from(new Set([
    'clang-format',
    'clang-format-19',
    'clang-format-18',
    'clang-format-17',
    'clang-format-16',
    'C:/Program Files/LLVM/bin/clang-format.exe',
    'C:/Program Files (x86)/LLVM/bin/clang-format.exe',
    'C:/msys64/ucrt64/bin/clang-format.exe',
    'C:/msys64/mingw64/bin/clang-format.exe',
    'C:/msys64/clang64/bin/clang-format.exe',
    'C:/Program Files/Microsoft Visual Studio/2022/Community/VC/Tools/Llvm/bin/clang-format.exe',
    'C:/Program Files/Microsoft Visual Studio/2022/Professional/VC/Tools/Llvm/bin/clang-format.exe',
    'C:/Program Files/Microsoft Visual Studio/2022/Enterprise/VC/Tools/Llvm/bin/clang-format.exe',
    'C:/Program Files/Microsoft Visual Studio/2022/BuildTools/VC/Tools/Llvm/bin/clang-format.exe',
    '/usr/bin/clang-format',
    '/usr/local/bin/clang-format',
    '/opt/homebrew/opt/llvm/bin/clang-format',
    '/usr/local/opt/llvm/bin/clang-format',
  ]))
}

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<AppTheme>(readStoredTheme())
  const clangFormatExecutablePath = ref(readStoredClangFormatExecutablePath())
  const locale = ref<AppLocale>(readStoredLocale())
  const detectedClangFormatExecutablePath = ref('')
  const detectedClangFormatVersion = ref('')
  const isDetectingClangFormat = ref(false)
  const clangFormatDetectionAttempted = ref(false)

  const isTauri = '__TAURI_INTERNALS__' in window

  const effectiveClangFormatExecutablePath = computed(() => {
    return clangFormatExecutablePath.value.trim() || detectedClangFormatExecutablePath.value.trim()
  })

  const resolvedClangFormatExecutable = computed(() => {
    return effectiveClangFormatExecutablePath.value || 'clang-format'
  })

  async function inspectClangFormat(executablePath: string) {
    const { invoke } = await import('@tauri-apps/api/core')
    return invoke<ClangFormatInspection>('inspect_clang_format', {
      executablePath: executablePath.trim() || undefined,
    })
  }

  async function refreshDetectedClangFormat(force = false) {
    if (!isTauri) {
      clangFormatDetectionAttempted.value = true
      return null
    }

    if (isDetectingClangFormat.value) {
      return null
    }

    if (!force && clangFormatDetectionAttempted.value && detectedClangFormatExecutablePath.value) {
      return {
        resolvedPath: detectedClangFormatExecutablePath.value,
        version: detectedClangFormatVersion.value,
      }
    }

    isDetectingClangFormat.value = true
    clangFormatDetectionAttempted.value = true

    for (const candidate of getDetectionCandidates()) {
      try {
        const info = await inspectClangFormat(candidate)
        detectedClangFormatExecutablePath.value = info.resolvedPath
        detectedClangFormatVersion.value = info.version
        isDetectingClangFormat.value = false
        return info
      } catch {
        continue
      }
    }

    detectedClangFormatExecutablePath.value = ''
    detectedClangFormatVersion.value = ''
    isDetectingClangFormat.value = false
    return null
  }

  watch(theme, (value) => {
    localStorage.setItem(THEME_STORAGE_KEY, value)
    applyTheme(value)
  }, { immediate: true })

  watch(clangFormatExecutablePath, (value) => {
    localStorage.setItem(CLANG_FORMAT_EXECUTABLE_PATH_STORAGE_KEY, value.trim())
  }, { immediate: true })

  watch(locale, (value) => {
    localStorage.setItem(APP_LOCALE_STORAGE_KEY, value)
  }, { immediate: true })

  return {
    theme,
    clangFormatExecutablePath,
    locale,
    detectedClangFormatExecutablePath,
    detectedClangFormatVersion,
    isDetectingClangFormat,
    clangFormatDetectionAttempted,
    effectiveClangFormatExecutablePath,
    resolvedClangFormatExecutable,
    inspectClangFormat,
    refreshDetectedClangFormat,
  }
})