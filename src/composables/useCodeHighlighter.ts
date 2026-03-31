import { createHighlighter, type Highlighter } from 'shiki'

export const SUPPORTED_CODE_LANGS = [
  'cpp',
  'yaml',
  'csharp',
  'java',
  'javascript',
  'objective-c',
  'proto',
  'verilog',
] as const

export type SupportedCodeLang = typeof SUPPORTED_CODE_LANGS[number]

let highlighterPromise: Promise<Highlighter> | null = null

export function getCodeThemeName() {
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'vitesse-light'
    : 'vitesse-dark'
}

export function normalizeCodeLanguage(lang: string): SupportedCodeLang {
  return SUPPORTED_CODE_LANGS.includes(lang as SupportedCodeLang)
    ? lang as SupportedCodeLang
    : 'cpp'
}

export function getCodeHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['vitesse-dark', 'vitesse-light'],
      langs: [...SUPPORTED_CODE_LANGS],
    })
  }

  return highlighterPromise
}

export function warmupCodeHighlighter() {
  void getCodeHighlighter()
}