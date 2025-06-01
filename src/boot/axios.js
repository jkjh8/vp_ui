import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const getAddr = () => {
  const devServerAddr = `http://${window.location.hostname}:3000`
  return process.env.NODE_ENV !== 'production' ? devServerAddr : window.location.origin
}

const api = axios.create({
  baseURL: getAddr() + '/api',
})

// API 인스턴스를 가져오는 전역 함수
export const getApi = () => api
export const getBaseURL = () => getAddr()

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = api
  app.config.globalProperties.$api = api

  // 전역에서 사용할 수 있도록 window 객체에 추가
  window.getApi = getApi
  window.getBaseURL = getBaseURL
})
