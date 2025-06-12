import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { useApiStore } from 'src/stores/useApi'

export const useFilesStore = defineStore('files', () => {
  const files = ref([])
  const { apiCallWithLoading } = useApiStore()

  const getFileList = async () => {
    const response = await apiCallWithLoading('/files', 'GET', null, 'Fetching file list...')
    files.value = response.data
  }

  const deleteFile = async (file) => {
    const response = await apiCallWithLoading(
      `/files/${file.uuid}`,
      'DELETE',
      null,
      `Deleting file ${file.uuid}...`,
    )
    if (response.status === 200) {
      files.value = files.value.filter((f) => f.uuid !== file.uuid)
    } else {
      console.error('Failed to delete file:', response.statusText)
    }
  }

  const downloadFile = async (file) => {
    const response = await apiCallWithLoading(
      `/files/download/${file.uuid}`,
      'GET',
      null,
      `Downloading file ${file.uuid}...`,
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
