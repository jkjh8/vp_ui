import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'

export const useApiStore = defineStore('api', () => {
  const $q = useQuasar()

  const getApi = () => {
    // boot에서 설정된 전역 API 함수 사용
    return window.getApi ? window.getApi() : null
  }

  const getAddr = () => {
    // boot에서 설정된 전역 함수 사용
    return window.getBaseURL ? window.getBaseURL() : window.location.origin
  }

  const apiCallWithLoading = async (
    url,
    method = 'GET',
    data = null,
    loadingMessage = 'Loading...',
  ) => {
    try {
      if (typeof url !== 'string') {
        throw new TypeError(`Invalid URL: ${url}`)
      }

      $q.loading.show({
        message: loadingMessage,
      })

      const options = {
        method,
        url,
        data,
      }
      const api = getApi()
      const response = await api(options)
      return response
    } catch (error) {
      console.error(`Error during API call:`, error)
      throw error
    } finally {
      $q.loading.hide()
    }
  }

  return { apiCallWithLoading, getApi, getAddr }
})
