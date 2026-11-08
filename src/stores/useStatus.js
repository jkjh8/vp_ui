import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { useApiStore } from 'src/stores/useApi'

export const useStatusStore = defineStore('status', () => {
  const { apiCallWithLoading } = useApiStore()

  const pStatus = ref({
    playlistMode: false,
    // 반복 모드 'none'|'all'|'repeat_one' — 기본값 없으면 시작 시 반복 버튼이 안 그려진다.
    repeat: 'none',
    // 창별 반복 모드 (윈도우 모드) { [windowId]: 'none'|'all'|'repeat_one' }. 없는 창은 전역 repeat 폴백.
    windowRepeat: {},
    // 전역 작업 모드 'scene'|'window' (장면형/윈도우형). 에디터/목록/신규 기본 타입 결정.
    playbackMode: 'scene',
    nics: [],
    playlist: [],
    audioDevice: '',
    audioDevices: [],
    fullscreen: false,
    file: {
      filename: '',
      size: 0,
      path: '',
      is_image: false,
    },
    player: {
      volume: 100,
      speed: 1.0,
      duration: 0,
      time: 0,
      position: 0.0,
      playing: false,
    },

    backgroundColor: '',
    imageTime: 0,
    // 하드웨어 가속: 'auto'|'on'|'off'|'hwonly' + 실효값('hardware'|'software') + 실효 모드
    hardwareAcceleration: 'auto',
    hardwareAccelEffective: null,
    hardwareAccelMode: null, // 'hw_only'|'on'|'off'
    // 최근 재생 실패 (HW 전용 코덱 미지원 등) {windowId,path,reason,message,at}
    lastPlaybackError: null,
    // 전역 오디오 마스터 볼륨 (0~100)
    masterVolume: 100,
    // 멀티 윈도우
    windows: [], // 사용자 정의 출력 창 설정
    windowPresets: [], // 화면 구성 프리셋 (배치 스냅샷 목록)
    activePresetId: null, // 현재 배치와 일치하는 프리셋 id ('현재' 배지)
    playerWindows: [], // 플레이어가 실제 보유한 창
    windowStates: {}, // 창별 재생 상태
    memory: {}, // 플레이어 memory_status
    preloadLookahead: 2,
    preloadMaxDecks: 8,
    // 프리로딩 상태 (UI "로딩됨/로딩중" 배지)
    preloadedPlaylistId: null,
    preloadStatus: {}, // { [windowId]: {expected, prerolled, ready} }
    preloadReady: false,
    display: {
      monitorIndex: -1,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      aspectMode: 'letterbox',
    },
    displays: [],
    // 병행 오디오 트랙 라이브 상태 { [itemId]: {time,duration,is_playing,state,...} }
    audioTracks: {},
    playerFeatures: [],
    // 라이브 입력 소스(RTP/RTSP/SRT) 창별 연결 상태 { [windowId]: {kind,state,reason,at} }
    sourceStates: {},
    // 타임라인
    timelineMode: false,
    timeline: {},
    timelinePos: { time_ms: 0, duration_ms: 0, is_playing: false },
    // 멀티 PC 동기. role standalone(기본)/slave/master. discovered/show는 master 콘솔용.
    sync: {
      role: 'standalone',
      domain: 0,
      leadMs: 1000,
      multicastAddr: '239.255.42.99',
      multicastPort: 15002,
      clockMode: 'auto', // 'auto'(HW PTP 우선→넷클럭 폴백) | 'ptp' | 'netclock'
      netClockPort: 15004,
      netMasterIp: '',
      playerId: '',
      ptp: {}, // { enabled, synced, mode, base_time, running_time }
      discovered: {}, // { [id]: {id,name,ip,restPort,role,playing,ptp,online,lastSeen} }
      show: { mode: 'mirror', domain: 0, leadMs: 1000, mirrorPlaylistId: null, mirrorTrackIdx: 0, assignments: {} },
    },
  })

  const updateStatus = async (key, newValue) => {
    const response = await apiCallWithLoading(
      '/status/update',
      'POST',
      { key, value: newValue },
      `Updating status for key "${key}"...`,
    )
    if (response.data.pStatus) {
      for (const [k, v] of Object.entries(response.data.pStatus)) {
        if (pStatus.value[k] !== undefined) {
          pStatus.value[k] = v
        } else {
          console.warn(`Unknown key "${k}" in pStatus`)
        }
      }
    }
    return response
  }

  const setAudioDevice = async (deviceId) => {
    const response = await apiCallWithLoading(
      '/player/setaudiodevice',
      'PUT',
      { deviceId },
      'Setting audio device...',
    )
    pStatus.value.audioDevice = deviceId
    return response
  }

  const getAudioDevices = async () => {
    const response = await apiCallWithLoading(
      '/player/audio_devices',
      'GET',
      null,
      'Getting current audio devices...',
    )
    return response
  }

  const getDisplays = async () => {
    const response = await apiCallWithLoading(
      '/player/displays',
      'GET',
      null,
      'Getting current displays...',
    )
    return response
  }

  const setDisplay = async (payload) => {
    const response = await apiCallWithLoading(
      '/player/display',
      'PUT',
      payload,
      'Setting display...',
    )
    pStatus.value.display = { ...pStatus.value.display, ...payload }
    return response
  }

  const isBright = (color) => {
    let c = color.trim().toLowerCase()
    if (c === 'white' || c === '#fff' || c === '#ffffff' || c === 'rgb(255,255,255)') return true
    if (c.startsWith('#')) {
      let hex = c.replace('#', '')
      if (hex.length === 3)
        hex = hex
          .split('')
          .map((x) => x + x)
          .join('')
      if (hex.length !== 6) return false
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return (r * 299 + g * 587 + b * 114) / 1000 > 186
    }
    if (c.startsWith('rgb')) {
      const m = c.match(/rgb\((\d+),(\d+),(\d+)\)/)
      if (m) {
        const r = parseInt(m[1]),
          g = parseInt(m[2]),
          b = parseInt(m[3])
        return (r * 299 + g * 587 + b * 114) / 1000 > 186
      }
    }
    return false
  }

  const updateImageTime = async (value) => {
    const response = await apiCallWithLoading(
      `/status/image_time/${value}`,
      'GET',
      null,
      `Updating image time to ${value}...`,
    )
    if (response.data.pStatus) {
      pStatus.value.imageTime = response.data.pStatus.imageTime
    }
  }

  return {
    pStatus,
    updateStatus,
    getAudioDevices,
    setAudioDevice,
    getDisplays,
    setDisplay,
    isBright,
    updateImageTime,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatusStore, import.meta.hot))
}
