import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useStatusStore } from 'src/stores/useStatus'
import confirmDialog from 'src/components/dialogs/confirmDialog.vue'

// 씬 모드 재생 가드 — 프리로딩(메모리 프리롤)이 완료되지 않은 채 재생하려 하면 확인창을 띄운다.
// 씬 모드는 전 창이 락스텝으로 동시에 시작하므로, 프리롤이 안 됐으면 시작 지연/창 간 동기 어긋남이
// 생길 수 있어 경고한다. 윈도우 모드(창별 독립 재생)는 대상이 아니다.
//
// 사용: const { confirmSceneReady } = usePlaybackGuard()
//       if (!(await confirmSceneReady(playlistId, mode))) return  // 취소
export function usePlaybackGuard() {
  const $q = useQuasar()
  const { t } = useI18n()
  const { pStatus } = storeToRefs(useStatusStore())

  // 반환: Promise<boolean> — true=계속 재생, false=취소
  const confirmSceneReady = (playlistId, mode) => {
    const m = mode || pStatus.value.playbackMode || 'scene'
    if (m === 'window') return Promise.resolve(true) // 윈도우 모드는 경고 대상 아님

    const ready =
      pStatus.value.preloadReady && pStatus.value.preloadedPlaylistId === playlistId
    if (ready) return Promise.resolve(true)

    return new Promise((resolve) => {
      $q.dialog({
        component: confirmDialog,
        componentProps: {
          title: t('app.playbackGuard.title'),
          message: t('app.playbackGuard.message'),
        },
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false))
    })
  }

  return { confirmSceneReady }
}
