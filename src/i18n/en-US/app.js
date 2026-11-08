// 컴포넌트 폴더에 속하지 않는 앱 전역 문자열 (컴포저블/부트).
export default {
  playbackGuard: {
    title: 'Preload Incomplete',
    message:
      'This playlist has not been loaded (preloaded) into memory yet. Playing now may delay ' +
      'the start or cause windows to fall out of sync. Continue playing? ' +
      '(Cancel to preload first with the “Load” button.)',
  },
  socket: {
    unknownFile: 'Unknown file',
    windowSuffix: ' · Window {id}',
    playFailed: 'Playback failed',
  },
}
