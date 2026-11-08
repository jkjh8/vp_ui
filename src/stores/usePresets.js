import { defineStore } from 'pinia'
import { useApiStore } from 'src/stores/useApi'
import { i18n } from 'src/boot/i18n'

// 화면 구성 프리셋 액션 — 목록은 pStatus.windowPresets(소켓)로 들어오므로 여기서는 명령만.
export const usePresetsStore = defineStore('presets', () => {
  const { apiCallWithLoading, getApi } = useApiStore()

  const getPresets = async () => {
    const res = await getApi().get('/player/presets')
    return res?.data?.presets || []
  }

  // 현재 출력 창 배치를 새 프리셋으로 저장
  const savePreset = (name) =>
    apiCallWithLoading('/player/presets', 'POST', { name }, i18n.global.t('layouts.saving'))

  // 프리셋 적용 — 현재 창을 프리셋 배치로 교체
  const applyPreset = (id) =>
    apiCallWithLoading(`/player/presets/${id}/apply`, 'POST', null, i18n.global.t('layouts.applying'))

  // 기존 프리셋을 현재 배치로 덮어쓰기
  const updatePreset = (id) =>
    apiCallWithLoading(`/player/presets/${id}`, 'PUT', {}, i18n.global.t('layouts.updating'))

  const renamePreset = (id, name) =>
    apiCallWithLoading(`/player/presets/${id}`, 'PUT', { name }, i18n.global.t('layouts.renaming'))

  const deletePreset = (id) =>
    apiCallWithLoading(`/player/presets/${id}`, 'DELETE', null, i18n.global.t('layouts.deleting'))

  return { getPresets, savePreset, applyPreset, updatePreset, renamePreset, deletePreset }
})
