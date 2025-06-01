import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { useApiStore } from 'src/stores/useApi'

export const usePlaylistStore = defineStore('Playlist', () => {
  const { apiCallWithLoading, api } = useApiStore()
  const playlist = ref([])
  const currentIndex = ref(0)
  const currentPlaylist = ref(null)
  const isPlaying = ref(false)

  const getPlaylist = async () => {
    const response = await apiCallWithLoading(() => api.get('/playlist'), 'Fetching playlist...')
    playlist.value = response.data
    console.log('Playlist fetched successfully:', playlist.value)
  }

  const addPlaylist = async (playlistData) => {
    const response = await apiCallWithLoading(
      () => api.post('/playlist', playlistData),
      'Creating playlist...',
    )
    if (response.status === 201) {
      console.log('Playlist added successfully:', response.data)
      await getPlaylist()
      return response.data
    } else {
      console.error('Failed to add playlist:', response.statusText)
      throw new Error(response.statusText)
    }
  }

  const updatePlaylist = async (playlistId, playlistData) => {
    const response = await apiCallWithLoading(
      () => api.put(`/playlist/${playlistId}`, playlistData),
      'Updating playlist...',
    )
    if (response.status === 200) {
      const index = playlist.value.findIndex((p) => p._id === playlistId)
      if (index !== -1) {
        playlist.value[index] = response.data
      }
      if (currentPlaylist.value?._id === playlistId) {
        currentPlaylist.value = response.data
      }
      console.log('Playlist updated successfully:', response.data)
      await getPlaylist()
      return response.data
    } else {
      console.error('Failed to update playlist:', response.statusText)
      throw new Error(response.statusText)
    }
  }

  const deletePlaylist = async (playlistId) => {
    const response = await apiCallWithLoading(
      () => api.delete(`/playlist/${playlistId}`),
      'Deleting playlist...',
    )
    if (response.status === 200) {
      playlist.value = playlist.value.filter((p) => p._id !== playlistId)
      if (currentPlaylist.value?._id === playlistId) {
        currentPlaylist.value = null
      }
      console.log('Playlist deleted successfully:', playlistId)
      await getPlaylist()
      return true
    } else {
      console.error('Failed to delete playlist:', response.statusText)
      throw new Error(response.statusText)
    }
  }

  return {
    playlist,
    currentIndex,
    currentPlaylist,
    isPlaying,
    getPlaylist,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlaylistStore, import.meta.hot))
}
