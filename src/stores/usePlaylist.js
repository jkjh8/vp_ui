import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { useApiStore } from 'src/stores/useApi'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import { toPersistedTrack } from 'src/composables/useTracks'
import { i18n } from 'src/boot/i18n'

export const usePlaylistStore = defineStore('Playlist', () => {
  const { pStatus } = storeToRefs(useStatusStore())
  const { apiCallWithLoading } = useApiStore()
  const playlists = ref([])
  const currentIndex = ref(0)
  const currentPlaylist = ref(null)
  const isPlaying = ref(false)

  const getPlaylists = async () => {
    const response = await apiCallWithLoading('/playlist', 'GET', null, 'Fetching playlist...')
    playlists.value = response.data
    return playlists.value
  }

  const addPlaylist = async (playlistData) => {
    try {
      const response = await apiCallWithLoading(
        '/playlist',
        'POST',
        playlistData,
        'Creating playlist...',
      )
      await getPlaylists()
      return response.data
    } catch (error) {
      console.error('Failed to add playlist:', error)
    }
  }

  const updatePlaylist = async (playlistId, playlistData) => {
    try {
      const response = await apiCallWithLoading(
        `/playlist`,
        'PUT',
        { ...playlistData, id: playlistId },
        'Updating playlist...',
      )
      await getPlaylists()
      return response.data
    } catch (error) {
      console.error('Failed to update playlist:', error)
    }
  }

  const deletePlaylist = async (playlistId) => {
    try {
      const response = await apiCallWithLoading(
        `/playlist/${playlistId}`,
        'DELETE',
        null,
        'Deleting playlist...',
      )
      await getPlaylists()
      return response.data
    } catch (error) {
      console.error('Error deleting playlist:', error)
    }
  }

  const removeTrackFromPlaylist = async (playlistId, idx) => {
    try {
      const playlist = playlists.value.find((p) => p._id === playlistId)
      if (!playlist) {
        throw new Error('Playlist not found')
      }
      playlist.tracks.splice(idx, 1)
      const response = await apiCallWithLoading(
        `/playlist`,
        'PUT',
        { tracks: playlist.tracks.map(toPersistedTrack), id: playlistId },
        'Removing track from playlist...',
      )
      await getPlaylists()
      return response.data
    } catch (error) {
      console.error('Error removing track from playlist:', error)
    }
  }

  const changeCurrentPlaylist = (index) => {
    currentPlaylist.value = index
    // 호스트에 "현재 열린 플레이리스트" 통지 — 편집 시 이 플레이리스트만 프리로드/배지 처리.
    const pl = playlists.value.find((p) => p._id === index)
    if (pl?.playlistId) {
      const { getApi } = useApiStore()
      getApi()
        .put('/playlist/select', { playlistId: pl.playlistId })
        .catch((e) => console.error('Error selecting playlist:', e))
    }
  }

  const getCurrentPlaylistId = () => {
    if (currentPlaylist.value) {
      const playlist = playlists.value.find((p) => p._id === currentPlaylist.value)
      return playlist ? playlist.playlistId : null
    }
    return null
  }

  const playCurrentPlaylist = () => {
    if (currentPlaylist.value) {
      pStatus.value.playlistMode = true
      isPlaying.value = true
    } else {
      console.error('No current playlist to play')
    }
  }

  // 재생 중인 추가 오디오의 볼륨/뮤트 라이브 변경 (슬라이더/토글 — 목록 재조회 없이 즉시).
  // 영속화는 updateTrack(audios)로 별도.
  const setTrackAudioLive = async (audioId, patch) => {
    try {
      const { getApi } = useApiStore()
      await getApi().put('/playlist/track_audio/live', { audioId, ...patch })
    } catch (error) {
      console.error('Error updating track audio live:', error)
    }
  }

  // 현재 재생 트랙의 임베디드 오디오 라이브 변경 (볼륨 드래그 등). 영속화는 updateTrack.
  const setDeckAudioLive = async (patch) => {
    try {
      const { getApi } = useApiStore()
      await getApi().put('/playlist/deck_audio/live', patch)
    } catch (error) {
      console.error('Error updating deck audio live:', error)
    }
  }

  // 트랙 부분 갱신 (시간/볼륨/채널 라우팅/뮤트/추가 오디오) — PUT /playlist/track {id, idx, patch}
  const updateTrack = async (playlistId, idx, patch) => {
    try {
      await apiCallWithLoading(
        '/playlist/track',
        'PUT',
        { id: playlistId, idx, patch },
        'Updating track...',
      )
      await getPlaylists()
    } catch (error) {
      console.error('Error updating track:', error)
    }
  }

  const playlistPlay = async (index, track = 0) => {
    await apiCallWithLoading(
      `/playlist/play?playlistId=${index}&trackIndex=${track}`,
      'GET',
      null,
      'Playing playlist...',
    )
  }

  // 플레이리스트 로딩(프리로딩만, 재생 안 함) — 전 트랙을 메모리에 프리롤
  const preloadPlaylist = async (index) => {
    await apiCallWithLoading(
      `/playlist/preload?playlistId=${index}`,
      'GET',
      null,
      'Loading playlist...',
    )
  }

  // 전역 작업 모드 ('scene'|'window') 토글. pStatus.playbackMode는 소켓으로 다시 밀려온다.
  const setPlaybackMode = async (value) => {
    const { getApi } = useApiStore()
    await getApi().put('/playlist/playbackmode', { value })
  }

  // 플레이리스트 1개의 타입 즉시 전환 (상단 토글) — tracks를 대상 모드 형태로 변환·저장 후 새로고침.
  const switchPlaylistMode = async (playlistDbId, value) => {
    await apiCallWithLoading(
      '/playlist/mode_switch',
      'PUT',
      { id: playlistDbId, mode: value },
      i18n.global.t('stores.playlist.modeSwitch'),
    )
    await getPlaylists()
  }

  // 윈도우 모드: 단일 창 재생 (창별 재생 버튼).
  const playWindow = async (playlistId, windowId, index = 0) => {
    await apiCallWithLoading(
      `/playlist/window/play?playlistId=${playlistId}&windowId=${windowId}&index=${index}`,
      'GET',
      null,
      i18n.global.t('stores.playlist.windowPlay'),
    )
  }

  // 윈도우 모드: 단일 창 정지 (창별 정지 버튼).
  const stopWindow = async (windowId) => {
    await apiCallWithLoading(
      `/playlist/window/stop?windowId=${windowId}`,
      'GET',
      null,
      i18n.global.t('stores.playlist.windowStop'),
    )
  }

  return {
    playlists,
    currentIndex,
    currentPlaylist,
    isPlaying,
    getPlaylists,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    changeCurrentPlaylist,
    removeTrackFromPlaylist,
    playCurrentPlaylist,
    playlistPlay,
    preloadPlaylist,
    setPlaybackMode,
    switchPlaylistMode,
    playWindow,
    stopWindow,
    getCurrentPlaylistId,
    updateTrack,
    setTrackAudioLive,
    setDeckAudioLive,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlaylistStore, import.meta.hot))
}
