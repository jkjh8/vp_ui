import { api } from '/src/boot/axios'
import { socket } from '/src/boot/socketio'
import { useStatusStore } from '/src/stores/useStatus'
import { storeToRefs } from 'pinia'
const { pStatus } = storeToRefs(useStatusStore())
// 플레이어 관련 API 호출 함수들
const fnPlayById = (id) => {
  try {
    return api.get(`/player/playid/${id}`)
  } catch (error) {
    console.error('Error playing media by ID:', error)
  }
}

const fnPlay = async () => {
  try {
    const r = await api.get('/player/play')
    console.log(r)
  } catch (error) {
    pStatus.value.current = {}
    console.error('Error playing media:', error)
  }
}

const fnStop = async () => {
  try {
    const r = await api.get('/player/stop')
    console.log(r)
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

const fnUpdateTime = (time) => {
  try {
    socket.emit('event', { type: 'time', value: time })
  } catch (error) {
    console.error('Error updating time:', error)
  }
}

const fnSetFullscreen = (fullscreen) => {
  try {
    socket.emit('event', { type: 'fullscreen', value: fullscreen })
  } catch (error) {
    console.error('Error setting fullscreen mode:', error)
  }
}
const fnSetLogo = (logo) => {
  try {
    socket.emit('event', { type: 'logo', value: logo })
  } catch (error) {
    console.error('Error setting logo:', error)
  }
}
const fnShowLogo = (show) => {
  try {
    socket.emit('event', { type: 'show_logo', value: show })
  } catch (error) {
    console.error('Error showing logo:', error)
  }
}
const fnSetLogoSize = (height, width) => {
  try {
    socket.emit('event', { type: 'logo_size', height, width })
  } catch (error) {
    console.error('Error setting logo size:', error)
  }
}
const fnSetBackground = (color) => {
  try {
    socket.emit('event', { type: 'background', value: color })
  } catch (error) {
    console.error('Error setting background:', error)
  }
}

export {
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
