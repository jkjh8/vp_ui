import { api } from '/src/boot/axios'

const fnPlayById = (id) => {
  return api.get(`/player/playid/${id}`)
}

const fnPlay = () => {
  return api.get('/player/play')
}

const fnStop = () => {
  return api.get('/player/stop')
}

const fnPause = () => {
  return api.get('/player/pause')
}

export { fnPlayById, fnPlay, fnStop, fnPause }
