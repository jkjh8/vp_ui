import { io } from 'socket.io-client'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
const { pStatus } = storeToRefs(useStatusStore())
let socket

// 재귀적으로 하위 오브젝트의 값까지 있는 값만 변경
function deepAssign(target, source) {
  for (const key in source) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] !== undefined &&
      typeof target[key] === 'object'
    ) {
      deepAssign(target[key], source[key])
    } else if (source[key] !== undefined) {
      target[key] = source[key]
    }
  }
}

export default async ({ app }) => {
  // 서버 주소는 환경에 맞게 설정
  const serverUrl =
    process.env.NODE_ENV !== 'production'
      ? `http://${window.location.hostname}:3000`
      : window.location.origin

  socket = io(serverUrl)

  try {
    socket.on('connect', () => {
      console.log('Socket connected')
    })
    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })
    socket.on('pStatus', (status) => {
      deepAssign(pStatus.value, status)
    })
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
    console.log('Socket initialized successfully')
  } catch (error) {
    console.error('Error initializing socket:', error)
  }

  // 전역 속성 등록 (Options API에서 this.$socket 사용 가능)
  app.config.globalProperties.$socket = socket
}

export { socket }
