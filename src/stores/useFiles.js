import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { useApiStore } from 'src/stores/useApi'

export const useFilesStore = defineStore('files', () => {
  const files = ref([])
  const { apiCallWithLoading, getApi } = useApiStore()

  const getFileList = async () => {
    const response = await apiCallWithLoading(() => getApi().get('/files'))
    files.value = response.data
    console.log('File list fetched successfully:', files.value)
  }

  const deleteFile = async (file) => {
    const response = await apiCallWithLoading(() => getApi().delete(`/files/${file.uuid}`))
    if (response.status === 200) {
      console.log('File deleted successfully:', file)
      files.value = files.value.filter((f) => f.uuid !== file.uuid)
    } else {
      console.error('Failed to delete file:', response.statusText)
    }
  }

  const downloadFile = async (file) => {
    const response = await apiCallWithLoading(() =>
      getApi().get(`/files/download/${file.uuid}`, { responseType: 'blob' }),
    )
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file.filename)
    document.body.appendChild(link)
    link.click()
  }
  return { files, getFileList, deleteFile, downloadFile }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFilesStore, import.meta.hot))
}
