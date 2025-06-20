import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { useApiStore } from 'src/stores/useApi'

export const useStatusStore = defineStore('status', () => {
  const { apiCallWithLoading } = useApiStore()

  const pStatus = ref({
    playlistMode: false,
    nics: [],
    playlist: [],
    device: {
      audiodevice: '',
      audiodevices: [],
    },
    fullscreen: false,
    logo: {
      show: false,
      file: '',
      width: 0,
      height: 0,
      size: 0,
      x: 0,
      y: 0,
    },
    player: [
      {
        event: '',
        buffering: 0,
        volume: 100,
        speed: 1.0,
        duration: 0,
        time: 0,
        position: 0.0,
        playing: false,
        file: {
          filename: '',
          size: 0,
          path: '',
          is_image: false,
        },
      },
    ],
    background: '',
    imageTime: 0,
  })

  const updateStatus = async (key, newValue) => {
    const response = await apiCallWithLoading(
      '/status/update',
      'POST',
      { key, value: newValue },
      `Updating status for key "${key}"...`,
    )
    if (response.data.pStatus) {
      for (const [k, v] of Object.entries(response.data.pStatus)) {
        if (pStatus.value[k] !== undefined) {
          pStatus.value[k] = v
        } else {
          console.warn(`Unknown key "${k}" in pStatus`)
        }
      }
    }
    return response
  }

  const setAudioDevice = async (deviceId) => {
    const response = await apiCallWithLoading(
      '/player/setaudiodevice',
      'PUT',
      { deviceId },
      'Setting audio device...',
    )
    pStatus.value.device.audiodevice = deviceId
    return response
  }

  const getAudioDevices = async () => {
    const response = await apiCallWithLoading(
      '/player/audio_devices',
      'GET',
      null,
      'Getting current audio devices...',
    )
    return response
  }

  const isBright = (color) => {
    let c = color.trim().toLowerCase()
    if (c === 'white' || c === '#fff' || c === '#ffffff' || c === 'rgb(255,255,255)') return true
    if (c.startsWith('#')) {
      let hex = c.replace('#', '')
      if (hex.length === 3)
        hex = hex
          .split('')
          .map((x) => x + x)
          .join('')
      if (hex.length !== 6) return false
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return (r * 299 + g * 587 + b * 114) / 1000 > 186
    }
    if (c.startsWith('rgb')) {
      const m = c.match(/rgb\((\d+),(\d+),(\d+)\)/)
      if (m) {
        const r = parseInt(m[1]),
          g = parseInt(m[2]),
          b = parseInt(m[3])
        return (r * 299 + g * 587 + b * 114) / 1000 > 186
      }
    }
    return false
  }

  const updateImageTime = async (value) => {
    const response = await apiCallWithLoading(
      `/status/image_time/${value}`,
      'GET',
      null,
      `Updating image time to ${value}...`,
    )
    if (response.data.pStatus) {
      pStatus.value.imageTime = response.data.pStatus.imageTime
    }
  }

  const updateLogo = async (logoName) => {
    const response = await apiCallWithLoading(
      `/status/logo/sel/${encodeURIComponent(logoName)}`,
      'GET',
      null,
      `Updating logo to ${logoName}...`,
    )
    if (response.data.pStatus) {
      pStatus.value.logo = response.data.pStatus.logo
    }
    // 로고가 변경되면 상태 업데이트
    await updateStatus('logo', pStatus.value.logo)
  }

  const updateLogoSize = async (size) => {
    const response = await apiCallWithLoading(
      '/status/logo/size',
      'PUT',
      { size },
      'Updating logo size...',
    )
    if (!response.data.pStatus || !response.data.pStatus.logo) {
      console.error('Failed to update logo size:', response.data)
      return
    }
    pStatus.value.logo = response.data.pStatus.logo
    await updateStatus('logo', pStatus.value.logo)
  }

  const updateLogoVisibility = async (isVisible) => {
    const response = await apiCallWithLoading(
      `/status/logo/show/${isVisible ? 'true' : 'false'}`,
      'GET',
      null,
      `Updating logo visibility to ${isVisible ? 'visible' : 'hidden'}...`,
    )
    pStatus.value.logo = response.data.pStatus.logo
  }

  return {
    pStatus,
    updateStatus,
    getAudioDevices,
    setAudioDevice,
    isBright,
    updateImageTime,
    updateLogo,
    updateLogoSize,
    updateLogoVisibility,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatusStore, import.meta.hot))
}
