import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

export const useStatusStore = defineStore('status', () => {
  const pStatus = ref({
    mode: 'single',
    uuid: '',
    name: '',
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
    volume: 0,
    speed: 0,
    background: '',
  })

  return { pStatus }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatusStore, import.meta.hot))
}
