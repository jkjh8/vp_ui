import { defineStore, storeToRefs } from 'pinia'
import { useApiStore } from '/src/stores/useApi'
import { useStatusStore } from '/src/stores/useStatus'
import { socket } from '/src/boot/socketio'

export const usePlayerStore = defineStore('player', () => {
  // 플레이어 관련 API 호출 함수들
  const { pStatus } = storeToRefs(useStatusStore())
  const { apiCallWithLoading } = useApiStore()

  const fnPlayById = async (id) => {
    try {
      return await apiCallWithLoading(`/player/playid/${id}`, 'GET', null)
    } catch (error) {
      console.error('Error playing media by ID:', error)
    }
  }

  const fnPlay = async () => {
    try {
      const r = await apiCallWithLoading('/player/play', 'GET', null)
      console.log(r)
    } catch (error) {
      pStatus.current = {}
      console.error('Error playing media:', error)
    }
  }

  const fnStop = async () => {
    try {
      const r = await apiCallWithLoading('/player/stop', 'GET', null)
      console.log(r)
    } catch (error) {
      console.error('Error stopping media:', error)
    }
  }

  const fnPause = async () => {
    try {
      const r = await apiCallWithLoading('/player/pause', 'GET', null)
      console.log(r)
    } catch (error) {
      console.error('Error pausing media:', error)
    }
  }

  const fnUpdateTime = async (time) => {
    try {
      socket.emit('event', { type: 'time', value: time })
    } catch (error) {
      console.error('Error updating time:', error)
    }
  }

  const fnSetFullscreen = async (fullscreen) => {
    try {
      await apiCallWithLoading(`/player/fullscreen/${fullscreen}`, 'GET', null)
    } catch (error) {
      console.error('Error setting fullscreen mode:', error)
    }
  }

  const fnSetLogo = async (logo) => {
    try {
      await apiCallWithLoading('/player/logo', 'POST', { logo })
    } catch (error) {
      console.error('Error setting logo:', error)
    }
  }

  const fnShowLogo = async (show) => {
    try {
      await apiCallWithLoading('/player/show_logo', 'POST', { show })
    } catch (error) {
      console.error('Error showing logo:', error)
    }
  }

  const fnSetLogoSize = async (height, width) => {
    try {
      await apiCallWithLoading('/player/logo_size', 'POST', { height, width })
    } catch (error) {
      console.error('Error setting logo size:', error)
    }
  }

  const fnSetBackground = async (color) => {
    try {
      await apiCallWithLoading('/player/background', 'POST', { color })
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
