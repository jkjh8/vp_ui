import { api } from '/src/boot/axios'
import { useStatusStore } from '/src/stores/useStatus'
import { storeToRefs } from 'pinia'
const { pStatus } = storeToRefs(useStatusStore())
// 플레이어 관련 API 호출 함수들
const fnPlayById = (id) => {
  return api.get(`/player/playid/${id}`)
}

const fnPlay = async () => {
  try {
    const r = await api.get('/player/play')
    console.log(r)
  } catch (error) {
    console.error('Error playing media:', error)
  }
}

const fnStop = async () => {
  try {
    const r = await api.get('/player/stop')
    console.log(r)
    pStatus.value.current = null
  } catch (error) {
    console.error('Error stopping media:', error)
  }
}

const fnPause = async () => {
  try {
    const r = await api.get('/player/pause')
    console.log(r)
  } catch (error) {
    console.error('Error pausing media:', error)
  }
}

export { fnPlayById, fnPlay, fnStop, fnPause }
