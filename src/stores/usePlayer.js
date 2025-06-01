import { defineStore, storeToRefs } from 'pinia'
import { useApiStore } from '/src/stores/useApi'
import { socket } from '/src/boot/socketio'
import { useStatusStore } from '/src/stores/useStatus'

export const usePlayerStore = defineStore('player', () => {
  // 플레이어 관련 API 호출 함수들
  const { pStatus } = storeToRefs(useStatusStore())
  const { apiCallWithLoading, getApi } = useApiStore()

  const fnPlayById = async (id) => {
    try {
      return await apiCallWithLoading(() => getApi().get(`/player/playid/${id}`))
    } catch (error) {
      console.error('Error playing media by ID:', error)
    }
  }

  const fnPlay = async () => {
    try {
      const r = await apiCallWithLoading(() => getApi().get('/player/play'))
      console.log(r)
    } catch (error) {
      pStatus.current = {}
      console.error('Error playing media:', error)
    }
  }

  const fnStop = async () => {
    try {
      const r = await apiCallWithLoading(() => getApi().get('/player/stop'))
      console.log(r)
    } catch (error) {
      console.error('Error stopping media:', error)
    }
  }

  const fnPause = async () => {
    try {
      const r = await apiCallWithLoading(() => getApi().get('/player/pause'))
      console.log(r)
    } catch (error) {
      console.error('Error pausing media:', error)
    }
  }

  const fnUpdateTime = async (time) => {
    try {
      await apiCallWithLoading(() => socket.emit('event', { type: 'time', value: time }))
    } catch (error) {
      console.error('Error updating time:', error)
    }
  }

  const fnSetFullscreen = async (fullscreen) => {
    try {
      await apiCallWithLoading(() =>
        socket.emit('event', { type: 'fullscreen', value: fullscreen }),
      )
    } catch (error) {
      console.error('Error setting fullscreen mode:', error)
    }
  }

  const fnSetLogo = async (logo) => {
    try {
      await apiCallWithLoading(() => socket.emit('event', { type: 'logo', value: logo }))
    } catch (error) {
      console.error('Error setting logo:', error)
    }
  }

  const fnShowLogo = async (show) => {
    try {
      await apiCallWithLoading(() => socket.emit('event', { type: 'show_logo', value: show }))
    } catch (error) {
      console.error('Error showing logo:', error)
    }
  }

  const fnSetLogoSize = async (height, width) => {
    try {
      await apiCallWithLoading(() => socket.emit('event', { type: 'logo_size', height, width }))
    } catch (error) {
      console.error('Error setting logo size:', error)
    }
  }

  const fnSetBackground = async (color) => {
    try {
      await apiCallWithLoading(() => socket.emit('event', { type: 'background', value: color }))
    } catch (error) {
      console.error('Error setting background:', error)
    }
  }

  return {
    fnPlayById,
    fnPlay,
    fnStop,
    fnPause,
    fnUpdateTime,
    fnSetFullscreen,
    fnSetLogo,
    fnShowLogo,
    fnSetLogoSize,
    fnSetBackground,
  }
})
