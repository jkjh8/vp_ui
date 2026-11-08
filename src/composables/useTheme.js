import { Dark } from 'quasar'
import { computed } from 'vue'

// 라이트/다크 테마 토글 + localStorage 영속.
// 저장값 'dark' | 'light' | 'auto'(시스템). boot/theme.js가 첫 페인트 전 적용한다.
const STORAGE_KEY = 'vp-theme'

export function applyStoredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark') Dark.set(true)
  else if (saved === 'light') Dark.set(false)
  else Dark.set('auto')
}

export function useTheme() {
  const isDark = computed(() => Dark.isActive)

  const toggle = () => {
    const next = !Dark.isActive
    Dark.set(next)
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
  }

  return { isDark, toggle }
}
