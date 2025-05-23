import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

let api, addr
const devServerAddr = `http://${window.location.hostname}:3000`

console.log('node env:', process.env.NODE_ENV)
if (process.env.NODE_ENV !== 'production') {
  addr = devServerAddr
  console.log('Using dev server address:', addr)
} else {
  addr = window.location.origin
  console.log('Using production server address:', addr)
}

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api, addr }
