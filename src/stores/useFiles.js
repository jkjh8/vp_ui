import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'
export const useFilesStore = defineStore('files', () => {
  const files = ref([])

  const getFileList = async () => {
    try {
      const response = await api.get('/files')
      files.value = response.data
      console.log('File list fetched successfully:', files.value)
    } catch (error) {
      console.error('Error fetching file list:', error)
    }
  }
  return { files, getFileList }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFilesStore, import.meta.hot))
}
