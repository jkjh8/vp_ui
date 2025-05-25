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

  const deleteFile = async (file) => {
    try {
      const r = await api.delete(`/files/${file.uuid}`)
      if (r.status === 200) {
        console.log('File deleted successfully:', file)
        files.value = files.value.filter((f) => f.uuid !== file.uuid)
      } else {
        console.error('Failed to delete file:', r.statusText)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }
  return { files, getFileList, deleteFile }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFilesStore, import.meta.hot))
}
