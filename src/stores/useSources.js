// 라이브 입력 소스(RTP/RTSP/SRT) 스토어 — 파일(useFiles)과 나란한 별도 축.
// 소스는 "정의"(주소/프로토콜/코덱 힌트)만 관리하고, 창 귀속은 화면 구성(Layouts)에서 한다.
import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { useApiStore } from 'src/stores/useApi'

export const useSourcesStore = defineStore('sources', () => {
  const sources = ref([])
  const { apiCallWithLoading } = useApiStore()

  const getSources = async () => {
    const res = await apiCallWithLoading('/sources', 'GET', null, 'Fetching sources...')
    sources.value = Array.isArray(res.data) ? res.data : []
    return sources.value
  }

  const createSource = async (data) => {
    const res = await apiCallWithLoading('/sources', 'POST', data, 'Creating source...')
    await getSources()
    return res.data
  }

  const updateSource = async (id, patch) => {
    const res = await apiCallWithLoading(`/sources/${id}`, 'PUT', patch, 'Updating source...')
    await getSources()
    return res.data
  }

  const deleteSource = async (id) => {
    await apiCallWithLoading(`/sources/${id}`, 'DELETE', null, 'Deleting source...')
    await getSources()
  }

  return { sources, getSources, createSource, updateSource, deleteSource }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSourcesStore, import.meta.hot))
}
