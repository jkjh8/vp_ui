import { useI18n } from 'vue-i18n'
import { LOCALE_STORAGE_KEY } from 'src/boot/i18n'

// 현재 언어 조회/변경 + localStorage 영속. 헤더의 언어 스위처가 사용한다.
export const LOCALE_OPTIONS = [
  { value: 'en-US', label: 'English', short: 'EN' },
  { value: 'ko-KR', label: '한국어', short: 'KO' },
]

export function useLocale() {
  const { locale } = useI18n({ useScope: 'global' })

  const setLocale = (value) => {
    if (!LOCALE_OPTIONS.some((o) => o.value === value)) return
    locale.value = value
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, value)
    } catch {
      // localStorage 사용 불가 시 무시 (세션 한정 적용)
    }
  }

  return { locale, setLocale, options: LOCALE_OPTIONS }
}
