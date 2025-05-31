import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useStatusStore = defineStore('status', () => {
  const pStatus = ref({
    playlistmode: false,
    nics: [],
    darkmode: false,
    current: {
      id: '',
      name: '',
      type: '',
    },
    playlist: [],
    device: {
      audiocurrentdevice: '',
      audiodevicelist: [],
    },
    fullscreen: false,
    logo: {
      show: false,
      file: '',
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    },
    player: {
      event: '',
      buffering: 0,
      media_path: '',
      filename: '',
      volume: 100,
      speed: 1.0,
      duration: 0,
      time: 0,
      position: 0.0,
      fullscreen: false,
      playing: false,
      is_image: false,
      image_path: null,
    },
    background: '',
  })
  // Function to update the status
  const updateStatus = async (key, newValue) => {
    try {
      const r = await api.post('/status/update', { key, value: newValue })
      console.log(r)
      if (r.data.pStatus) {
        // 서버에서 pStatus 전체를 반환하는 경우
        for (const [k, v] of Object.entries(r.data.pStatus)) {
          if (pStatus.value[k] !== undefined) {
            pStatus.value[k] = v
          } else {
            console.warn(`Unknown key "${k}" in pStatus`)
          }
        }
      }
      // 서버에서 pStatus 전체를 반환하지 않으므로, 성공 여부만 확인
      // 필요시 getStatus 등 별도 fetch로 동기화
    } catch (error) {
      console.error(`Error updating status for key "${key}":`, error)
    }
  }

  return { pStatus, updateStatus }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatusStore, import.meta.hot))
}
