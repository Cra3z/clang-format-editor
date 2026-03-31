import { createI18n } from 'vue-i18n'
import { messages, type SupportedLocale } from './messages'

export const i18n = createI18n({
  legacy: false,
  locale: 'en-US' as SupportedLocale,
  fallbackLocale: 'en-US' as SupportedLocale,
  messages,
  missingWarn: false,
  fallbackWarn: false,
})

export function setI18nLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
}