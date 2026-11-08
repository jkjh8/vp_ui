import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useApiStore } from '/src/stores/useApi'
import { useStatusStore } from '/src/stores/useStatus'
import { socket } from '/src/boot/socketio'

export const usePlayerStore = defineStore('player', () => {
  // 플레이어 관련 API 호출 함수들
  const { pStatus } = storeToRefs(useStatusStore())
  const { apiCallWithLoading } = useApiStore()

  // 윈도우 모드에서 트랜스포트(시간표시/시크/Next·Prev)가 제어할 "선택된 창".
  // timeSlider의 창 선택 탭이 세팅한다. 씬 모드에선 미사용(백엔드가 무시).
  const selectedWindow = ref(null)

  // 윈도우 모드면 선택된 창만 제어하도록 windowId 쿼리를 붙인다(백엔드가 씬 모드에선 무시).
  const stepQuery = () => (selectedWindow.value != null ? `?windowId=${selectedWindow.value}` : '')

  const fnPlay = async () => {
    try {
      await apiCallWithLoading(
        `/player/play/${pStatus.value.activePlayerId}${stepQuery()}`,
        'GET',
        null,
      )
    } catch (error) {
      pStatus.current = {}
      console.error('Error playing media:', error)
    }
  }

  // 선택된 창만 정지 (윈도우 모드). 전체 정지는 fnStopAll.
  const fnStop = async () => {
    try {
      await apiCallWithLoading(`/player/stop${stepQuery()}`, 'GET', null)
    } catch (error) {
      console.error('Error stopping media:', error)
    }
  }

  // 전체 정지 (windowId 없이 = 전 창 정지)
  const fnStopAll = async () => {
    try {
      await apiCallWithLoading('/player/stop', 'GET', null)
    } catch (error) {
      console.error('Error stopping all:', error)
    }
  }

  const fnPause = async () => {
    try {
      await apiCallWithLoading(
        `/player/pause/${pStatus.value.activePlayerId}${stepQuery()}`,
        'GET',
        null,
      )
    } catch (error) {
      console.error('Error pausing media:', error)
    }
  }

  const fnPrev = async () => {
    try {
      await apiCallWithLoading(`/player/prev${stepQuery()}`, 'GET', null)
    } catch (error) {
      console.error('Error playing previous media:', error)
    }
  }

  const fnNext = async () => {
    try {
      await apiCallWithLoading(`/player/next${stepQuery()}`, 'GET', null)
    } catch (error) {
      console.error('Error playing next media:', error)
    }
  }

  // time = 초 단위. windowId 지정 시 그 창만 시크(윈도우 모드), 미지정이면 기본/활성 덱.
  const fnUpdateTime = async (time, windowId = null) => {
    try {
      const payload = { type: 'time', value: time, idx: pStatus.value.activePlayerId }
      if (windowId != null) payload.windowId = windowId
      socket.emit('event', payload)
    } catch (error) {
      console.error('Error updating time:', error)
    }
  }

  const fnSetFullscreen = async (fullscreen) => {
    try {
      await apiCallWithLoading(`/player/fullscreen/${fullscreen}`, 'GET', null)
    } catch (error) {
      console.error('Error setting fullscreen mode:', error)
    }
  }

  const fnSetBackground = async (color) => {
    try {
      await apiCallWithLoading('/player/background', 'POST', { color })
    } catch (error) {
      console.error('Error setting background:', error)
    }
  }

  // 반복 모드 토글. windowId 지정 시 그 창만(윈도우 모드) — 응답은 socket pStatus로 반영되지만
  // 즉시 반응성을 위해 응답값도 로컬에 반영한다.
  const setRepeat = async (windowId = null) => {
    try {
      const q = windowId != null ? `?windowId=${windowId}` : ''
      const r = await apiCallWithLoading(`/player/repeat${q}`, 'GET', null)
      if (windowId != null) {
        pStatus.value.windowRepeat = { ...(pStatus.value.windowRepeat || {}), [windowId]: r.data.mode }
      } else {
        pStatus.value.repeat = r.data.mode
      }
      console.log('Repeat mode set to:', r.data.mode, windowId != null ? `(window ${windowId})` : '')
    } catch (error) {
      console.error('Error setting repeat mode:', error)
    }
  }

  return {
    selectedWindow,
    fnPlay,
    fnStop,
    fnStopAll,
    fnPause,
    fnPrev,
    fnNext,
    fnUpdateTime,
    fnSetFullscreen,
    fnSetBackground,
    setRepeat,
  }
})
