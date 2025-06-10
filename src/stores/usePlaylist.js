import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { useApiStore } from 'src/stores/useApi'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'

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
    console.log('Playlist fetched successfully:', playlists.value)
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

  const updateTracksInPlaylist = async (playlistId, tracksData) => {
    try {
      // 해당 플레이리스트의 트랙에 추가될 플레이 리스트 트랙들을 업데이트합니다.
      const playlist = playlists.value.find((p) => p._id === playlistId)
      if (!playlist) {
        throw new Error('Playlist not found')
      }
      const tracks = [...(playlist.tracks || []), ...tracksData].map((track) => track.uuid)
      const response = await apiCallWithLoading(
        `/playlist`,
        'PUT',
        { tracks: tracks, id: playlistId },
        'Updating tracks in playlist...',
      )
      await getPlaylists()
      return response.data
    } catch (error) {
      console.error('Error updating tracks in playlist:', error)
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
        { tracks: playlist.tracks.map((track) => track.uuid), id: playlistId },
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
      console.log('Playing current playlist:', currentPlaylist.value)
    } else {
      console.error('No current playlist to play')
    }
  }

  const playlistPlay = async (index, track = 0) => {
    console.log('playlistPlay called with index:', index, 'and track:', track)
    const response = await apiCallWithLoading(
      `/playlist/play?playlistId=${index}&trackIndex=${track}`,
      'GET',
      null,
      'Playing playlist...',
    )
    console.log('Playlist play response:', response)
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
    updateTracksInPlaylist,
    removeTrackFromPlaylist,
    playCurrentPlaylist,
    playlistPlay,
    getCurrentPlaylistId,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlaylistStore, import.meta.hot))
}
