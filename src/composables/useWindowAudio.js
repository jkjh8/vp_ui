// 창별 오디오 출력 정보. 창에 전용 디바이스(audioDevice)가 있으면 그 디바이스, 없으면 전역 디바이스
// 기준으로 채널수를 구한다 — 채널 라우팅 UI(출력 Ch 선택지)가 창마다 다른 디바이스를 반영하도록.
import { storeToRefs } from 'pinia'
import { useStatusStore } from 'src/stores/useStatus'

export function useWindowAudio() {
  const { pStatus } = storeToRefs(useStatusStore())

  const deviceOf = (deviceId) =>
    (pStatus.value.audioDevices || []).find((d) => d.deviceId === deviceId)
  // windowId=null → 전역 디바이스
  const deviceIdForWindow = (windowId) => {
    const w =
      windowId == null ? null : (pStatus.value.windows || []).find((x) => x.id === Number(windowId))
    return w?.audioDevice || pStatus.value.audioDevice
  }
  const channelsForWindow = (windowId) => deviceOf(deviceIdForWindow(windowId))?.channels ?? 2

  return { deviceOf, deviceIdForWindow, channelsForWindow }
}
