import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, computed } from 'vue'
import { useApiStore } from 'src/stores/useApi'
import { i18n } from 'src/boot/i18n'

// 플랫 폴더 목록(parentId 참조)을 q-tree용 중첩 노드로 변환.
// 최상단에 합성 root 노드(All Files, folderId=null)를 둔다.
const buildTree = (folders) => {
  const childrenOf = (parentId) =>
    folders
      .filter((f) => (f.parentId ?? null) === parentId)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'ko'))
      .map((f) => ({
        id: f._id,
        label: f.name,
        icon: 'folder',
        children: childrenOf(f._id),
      }))
  return [
    {
      id: 'root',
      label: i18n.global.t('stores.files.allFiles'),
      icon: 'folder_open',
      children: childrenOf(null),
    },
  ]
}

export const useFilesStore = defineStore('files', () => {
  const files = ref([])
  const folders = ref([])
  const currentFolderId = ref(null) // null = 루트
  const { apiCallWithLoading } = useApiStore()

  // 현재 선택된 폴더에 속한 파일만 (레거시 파일은 folderId 부재 → 루트)
  const filteredFiles = computed(() =>
    files.value.filter((f) => (f.folderId ?? null) === currentFolderId.value),
  )
  // i18n.global.locale 참조로 언어 전환 시 root('전체 파일') 라벨이 즉시 갱신되게 한다.
  const folderTree = computed(() => {
    void i18n.global.locale.value
    return buildTree(folders.value)
  })

  const getFileList = async () => {
    const response = await apiCallWithLoading('/files', 'GET', null, 'Fetching file list...')
    files.value = response.data
  }

  const getFolders = async () => {
    const response = await apiCallWithLoading('/folders', 'GET', null, 'Fetching folders...')
    folders.value = response.data
  }

  const createFolder = async (name, parentId = null) => {
    const response = await apiCallWithLoading(
      '/folders',
      'POST',
      { name, parentId },
      'Creating folder...',
    )
    await getFolders()
    return response.data
  }

  const renameFolder = async (id, name) => {
    await apiCallWithLoading(`/folders/${id}`, 'PUT', { name }, 'Renaming folder...')
    await getFolders()
  }

  const deleteFolder = async (id) => {
    const response = await apiCallWithLoading(
      `/folders/${id}`,
      'DELETE',
      null,
      'Deleting folder...',
    )
    // 삭제된 폴더(또는 자손)를 보고 있었다면 루트로 이동
    if (currentFolderId.value === id) currentFolderId.value = null
    await getFolders()
    await getFileList() // 포함 파일이 루트로 재배치됨
    return response.data
  }

  const moveFiles = async (uuids, folderId) => {
    const list = Array.isArray(uuids) ? uuids : [uuids]
    await apiCallWithLoading('/files/move', 'PUT', { uuids: list, folderId }, 'Moving files...')
    await getFileList()
  }

  const setCurrentFolder = (id) => {
    currentFolderId.value = id == null || id === 'root' ? null : id
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

  // 여러 파일 일괄 삭제 (uuids 배열). 성공 후 목록 새로고침.
  const deleteFiles = async (uuids) => {
    const list = Array.isArray(uuids) ? uuids : [uuids]
    if (list.length === 0) return
    await apiCallWithLoading(
      '/files',
      'DELETE',
      { uuids: list },
      `Deleting ${list.length} file(s)...`,
    )
    await getFileList()
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
  return {
    files,
    folders,
    currentFolderId,
    filteredFiles,
    folderTree,
    getFileList,
    getFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFiles,
    setCurrentFolder,
    deleteFile,
    deleteFiles,
    downloadFile,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFilesStore, import.meta.hot))
}
