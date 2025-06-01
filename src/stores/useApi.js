import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'

export const useApiStore = defineStore('api', () => {
  const $q = useQuasar()

  const getApi = () => {
    // boot에서 설정된 전역 API 함수 사용
    return window.getApi ? window.getApi() : null
  }

  const api = getApi()

  const getAddr = () => {
    // boot에서 설정된 전역 함수 사용
    return window.getBaseURL ? window.getBaseURL() : window.location.origin
  }

  const apiCallWithLoading = async (apiFunction, loadingMessage) => {
    try {
      $q.loading.show({
        message: loadingMessage,
      })
      const response = await apiFunction()
      return response
    } catch (error) {
      console.error(`Error during API call:`, error)
      throw error
    } finally {
      $q.loading.hide()
    }
  }

  return { apiCallWithLoading, api, getApi, getAddr }
})
