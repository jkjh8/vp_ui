import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

// 다국어(i18n) 부트 — 기본 언어는 영어, 선택값은 localStorage('vp-locale')에 영속.
// boot/theme.js와 같은 방식으로 첫 페인트 전에 저장된 로케일을 적용한다.
export const LOCALE_STORAGE_KEY = 'vp-locale'
export const DEFAULT_LOCALE = 'en-US'
export const SUPPORTED_LOCALES = ['en-US', 'ko-KR']

export function getStoredLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    return SUPPORTED_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

const i18n = createI18n({
  legacy: false, // Composition API 모드 (useI18n)
  locale: getStoredLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  globalInjection: true, // 템플릿에서 $t 사용 가능
  messages,
})

export default defineBoot(({ app }) => {
  app.use(i18n)
})

export { i18n }
