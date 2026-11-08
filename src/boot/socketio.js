import { io } from 'socket.io-client'
import { Notify } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import { i18n } from 'src/boot/i18n'
const { pStatus } = storeToRefs(useStatusStore())
let socket

// 재귀적으로 하위 오브젝트의 값까지 있는 값만 변경
function deepAssign(target, source) {
  for (const key in source) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] !== undefined &&
      typeof target[key] === 'object'
    ) {
      deepAssign(target[key], source[key])
    } else if (source[key] !== undefined) {
      target[key] = source[key]
    }
  }
}

export default async ({ app }) => {
  // 서버 주소는 환경에 맞게 설정
  const serverUrl =
    process.env.NODE_ENV !== 'production'
      ? `http://${window.location.hostname}:3000/client`
      : window.location.origin + '/client'

  socket = io(serverUrl)

  try {
    socket.on('connect', () => {
      console.log('Socket connected')
    })
    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })
    socket.on('pStatus', (status) => {
      // 통째 교체 키: 키 삭제가 의미를 갖는 맵/문서 — deepAssign 병합이면
      // 제거된 항목(정지된 오디오 트랙 등)이 좀비로 남는다
      // windowStates/memory/windows/playerWindows도 통째 교체 (창 삭제·키 제거·배열 재정렬이
      // deepAssign 병합이면 좀비로 남거나 인덱스가 어긋난다)
      for (const k of [
        'audioTracks',
        'timeline',
        'windowStates',
        'memory',
        'windows',
        'playerWindows',
        'preloadStatus',
        'sourceStates',
        'windowRepeat', // 창별 반복 — 창 삭제 시 키 제거가 의미(병합이면 좀비)
      ]) {
        if (k in status) {
          pStatus.value[k] = status[k]
          delete status[k]
        }
      }
      // sync 내부 discovered/show는 통째 교체 (오프라인 좀비·삭제된 assignment 방지), 나머지 sync는 병합
      if (status.sync && typeof status.sync === 'object') {
        if (!pStatus.value.sync) pStatus.value.sync = {}
        for (const sk of ['discovered', 'show']) {
          if (sk in status.sync) {
            pStatus.value.sync[sk] = status.sync[sk]
            delete status.sync[sk]
          }
        }
      }
      deepAssign(pStatus.value, status)
    })
    // 재생 실패(HW 전용 코덱 미지원/파일 오류 등) — 토스트로 즉시 표시.
    socket.on('playbackError', (payload) => {
      const name = (payload?.path || '').split(/[\\/]/).pop() || i18n.global.t('app.socket.unknownFile')
      const win =
        payload?.windowId != null ? i18n.global.t('app.socket.windowSuffix', { id: payload.windowId }) : ''
      Notify.create({
        type: 'negative',
        icon: 'error',
        message: payload?.message || i18n.global.t('app.socket.playFailed'),
        caption: `${name}${win}`,
        timeout: 6000,
        position: 'top',
        actions: [{ icon: 'close', color: 'white', round: true, dense: true }],
      })
    })
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
    console.log('Socket initialized successfully')
  } catch (error) {
    console.error('Error initializing socket:', error)
  }

  // 전역 속성 등록 (Options API에서 this.$socket 사용 가능)
  app.config.globalProperties.$socket = socket
}

export { socket }
