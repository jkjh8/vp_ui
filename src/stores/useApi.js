import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { i18n } from 'src/boot/i18n'

export const useApiStore = defineStore('api', () => {
  const $q = useQuasar()

  // 마스터 콘솔용 원격(프록시) axios 인스턴스 캐시 — 슬레이브 playerId → axios
  const fleetApis = new Map()

  const getAddr = () => {
    // boot에서 설정된 전역 함수 사용
    return window.getBaseURL ? window.getBaseURL() : window.location.origin
  }

  // target(슬레이브 playerId)이 주어지면 fleet 리버스 프록시(/api/fleet/players/:id/api)를 baseURL로 하는
  // axios를 반환 → 기존 컴포저블(useFiles/usePlaylist)이 상대 경로 그대로 원격 슬레이브를 조작한다.
  const getApi = (target = null) => {
    if (!target) return window.getApi ? window.getApi() : null
    if (!fleetApis.has(target)) {
      fleetApis.set(
        target,
        axios.create({ baseURL: getAddr() + '/api/fleet/players/' + target + '/api' }),
      )
    }
    return fleetApis.get(target)
  }

  const apiCallWithLoading = async (
    url,
    method = 'GET',
    data = null,
    loadingMessage = i18n.global.t('common.loading'),
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
