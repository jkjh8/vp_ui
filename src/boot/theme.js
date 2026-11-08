import { defineBoot } from '#q-app/wrappers'
import { applyStoredTheme } from 'src/composables/useTheme'

// 첫 페인트 전에 저장된 테마(라이트/다크/시스템)를 적용해 깜빡임을 막는다.
export default defineBoot(() => {
  applyStoredTheme()
})
