import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStatusStore } from 'src/stores/useStatus'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { usePlayerStore } from 'src/stores/usePlayer'
import { useApiStore } from 'src/stores/useApi'
import { usePlaybackGuard } from 'src/composables/usePlaybackGuard'
import { useI18n } from 'vue-i18n'

// 재생/now-playing 단일 진입점 (파사드).
// usePlayer(트랜스포트) + usePlaylist(플레이리스트/창 재생) + useStatus(pStatus 실상태)를 감싸,
// 컴포넌트가 트랜스포트에 대해 3개 스토어를 직접 만지지 않고 이 하나만 쓰게 한다.
// (스토어가 아니라 컴포저블인 이유: launchPlaylist가 usePlaybackGuard의 $q.dialog를 쓰므로
//  컴포넌트 setup 컨텍스트가 필요.)
export function usePlayback() {
  const statusStore = useStatusStore()
  const playlistStore = usePlaylistStore()
  const playerStore = usePlayerStore()
  const { getApi } = useApiStore()
  const { pStatus } = storeToRefs(statusStore)
  const { selectedWindow } = storeToRefs(playerStore)
  const { playlists, currentPlaylist } = storeToRefs(playlistStore)
  const { confirmSceneReady } = usePlaybackGuard()
  const { t } = useI18n()

  // ── 파생 상태 ─────────────────────────────────────────────
  // 트랜스포트가 제어하는 대상 모드 = 실제 재생 중인 플레이리스트의 타입.
  const isWindowMode = computed(() => pStatus.value.playlist?.mode === 'window')
  // 전역 작업 모드(에디터/신규 기본 타입) — 헤더 씬/윈도우 토글 상태.
  const globalMode = computed(() => pStatus.value.playbackMode || 'scene')

  const windows = computed(() => pStatus.value.windows || [])
  const windowStates = computed(() => pStatus.value.windowStates || {})
  const activeWinIds = computed(() =>
    Object.keys(windowStates.value)
      .map(Number)
      .sort((a, b) => a - b),
  )
  const anyWindowPlaying = computed(() => activeWinIds.value.length > 0)

  // 실제로 로드/재생 중인 플레이리스트 객체 (없으면 null)
  const nowPlaying = computed(() => {
    const p = pStatus.value.playlist
    return p && typeof p === 'object' && p.name ? p : null
  })
  const currentFile = computed(() => pStatus.value.file || null)

  // 재생/일시정지 토글 상태 — 윈도우 모드는 선택 창 기준, 그 외 전역.
  const isPlaying = computed(() => {
    if (isWindowMode.value && selectedWindow.value != null) {
      return !!windowStates.value[selectedWindow.value]?.player?.is_playing
    }
    return !!pStatus.value.player?.is_playing
  })

  const masterVolume = computed(() => pStatus.value.masterVolume ?? 100)
  const repeat = computed(() => pStatus.value.repeat || 'none')
  // 창별 반복 맵 { [windowId]: mode }. 명시값 없는 창은 전역 repeat로 폴백.
  const windowRepeat = computed(() => pStatus.value.windowRepeat || {})
  // 창 windowId의 실효 반복 모드 (창별 설정 우선, 없으면 전역).
  const repeatOf = (windowId) => windowRepeat.value[windowId] ?? repeat.value
  // 트랜스포트 반복 버튼이 표시할 값 — 윈도우 모드는 선택 창 기준, 그 외 전역.
  const currentRepeat = computed(() =>
    isWindowMode.value && selectedWindow.value != null
      ? repeatOf(selectedWindow.value)
      : repeat.value,
  )
  const memory = computed(() => pStatus.value.memory || {})
  const preloadedPlaylistId = computed(() => pStatus.value.preloadedPlaylistId ?? null)
  const preloadReady = computed(() => !!pStatus.value.preloadReady)
  const loaded = computed(() => preloadedPlaylistId.value != null)

  // 특정 플레이리스트(playlistId) 기준 프리로드 배지 상태
  const isLoadedFor = (playlistId) =>
    playlistId != null && preloadedPlaylistId.value === playlistId
  const isReadyFor = (playlistId) => isLoadedFor(playlistId) && preloadReady.value

  const winName = (id) =>
    windows.value.find((w) => w.id === Number(id))?.name || t('controls.windowN', { id })

  // ── 액션 ──────────────────────────────────────────────────
  // 트랜스포트 (playerStore에 위임 — 창 선택 인지)
  const play = playerStore.fnPlay
  const pause = playerStore.fnPause
  const stop = playerStore.fnStop
  const stopAll = playerStore.fnStopAll
  const next = playerStore.fnNext
  const prev = playerStore.fnPrev
  const seek = playerStore.fnUpdateTime // (time, windowId=null)
  const setRepeat = playerStore.setRepeat // (windowId=null) — 명시 창별 토글(WindowChip)
  // 트랜스포트 반복 버튼: 윈도우 모드는 선택 창만, 그 외 전역 토글.
  const toggleRepeat = () =>
    isWindowMode.value && selectedWindow.value != null
      ? setRepeat(selectedWindow.value)
      : setRepeat()
  const selectWindow = (id) => {
    selectedWindow.value = id
  }

  // 플레이리스트/창 재생
  const playWindow = (windowId, index = 0) =>
    playlistStore.playWindow(pStatus.value.playlist?.playlistId, windowId, index)
  const stopWindow = (windowId) => playlistStore.stopWindow(windowId)
  const preload = (playlistId) => playlistStore.preloadPlaylist(playlistId)
  const getPlaylists = () => playlistStore.getPlaylists()

  // 런치: (씬 모드) 프리롤 가드 → 재생. 반환 boolean(취소 시 false).
  const launchPlaylist = async (playlistId, playlistMode) => {
    const m = playlistMode || (isWindowMode.value ? 'window' : globalMode.value)
    if (!(await confirmSceneReady(playlistId, m))) return false
    await playlistStore.playlistPlay(playlistId)
    return true
  }

  // 전역 작업 모드 토글. playlistDbId 지정 시 그 플레이리스트 타입도 즉시 전환.
  const setGlobalMode = async (v, playlistDbId = null) => {
    await playlistStore.setPlaybackMode(v)
    if (playlistDbId) await playlistStore.switchPlaylistMode(playlistDbId, v)
  }

  // 창 오디오 전체 뮤트 — 운영 중 즉시 토글(로딩 스피너 없이). 상태는 pStatus.windows[].muted.
  const isWindowMuted = (windowId) =>
    !!windows.value.find((w) => w.id === Number(windowId))?.muted
  const toggleWindowMute = (windowId) =>
    getApi()
      .put(`/player/windows/${windowId}/mute`, { muted: !isWindowMuted(windowId) })
      .catch((e) => console.error('window mute:', e))

  // 마스터 볼륨 — 드래그 중 고빈도 호출이라 전역 로딩 스피너 없는 raw axios 사용.
  // live=true: 전송만(/live), false: 저장(persist).
  const setMasterVolume = (value, { live = false } = {}) => {
    const url = live ? '/player/master_volume/live' : '/player/master_volume'
    return getApi()
      .put(url, { value })
      .catch((e) => console.error('master volume:', e))
  }

  return {
    // 상태
    pStatus,
    isWindowMode,
    globalMode,
    windows,
    windowStates,
    activeWinIds,
    anyWindowPlaying,
    nowPlaying,
    currentFile,
    isPlaying,
    masterVolume,
    repeat,
    windowRepeat,
    currentRepeat,
    memory,
    selectedWindow,
    preloadedPlaylistId,
    preloadReady,
    loaded,
    playlists,
    currentPlaylist,
    // 헬퍼
    isLoadedFor,
    isReadyFor,
    winName,
    repeatOf,
    // 액션
    play,
    pause,
    stop,
    stopAll,
    next,
    prev,
    seek,
    setRepeat,
    toggleRepeat,
    selectWindow,
    playWindow,
    stopWindow,
    isWindowMuted,
    toggleWindowMute,
    preload,
    getPlaylists,
    launchPlaylist,
    setGlobalMode,
    setMasterVolume,
  }
}
