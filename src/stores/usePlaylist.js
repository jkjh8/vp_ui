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

  const getPlaylist = async () => {
    const response = await apiCallWithLoading('/playlist', 'GET', null, 'Fetching playlist...')
    playlists.value = response.data
    console.log('Playlist fetched successfully:', playlists.value)
  }

  const addPlaylist = async (playlistData) => {
    const response = await apiCallWithLoading(
      '/playlist',
      'POST',
      playlistData,
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
      `/playlist/${playlistId}`,
      'PUT',
      playlistData,
      'Updating playlist...',
    )
    if (response.status === 200) {
      const index = playlists.value.findIndex((p) => p._id === playlistId)
      if (index !== -1) {
        playlists.value[index] = response.data
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
      `/playlist/${playlistId}`,
      'DELETE',
      null,
      'Deleting playlist...',
    )
    if (response.status === 200) {
      playlists.value = playlists.value.filter((p) => p._id !== playlistId)
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

  const changeCurrentPlaylist = (index) => {
    currentPlaylist.value = index
  }

  const playCurrentPlaylist = () => {
    if (currentPlaylist.value) {
      pStatus.value.playlistmode = true
      isPlaying.value = true
      console.log('Playing current playlist:', currentPlaylist.value)
    } else {
      console.error('No current playlist to play')
    }
  }

  return {
    playlists,
    currentIndex,
    currentPlaylist,
    isPlaying,
    getPlaylist,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    changeCurrentPlaylist,
    playCurrentPlaylist,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlaylistStore, import.meta.hot))
}
