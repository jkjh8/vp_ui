// Pinia 스토어(컴포넌트 setup 밖)에서 쓰는 사용자 표시 문자열.
// 스토어에서는 i18n.global.t(...)로 호출한다.
export default {
  files: {
    allFiles: 'All Files',
  },
  playlist: {
    modeSwitch: 'Switching mode…',
    windowPlay: 'Playing window…',
    windowStop: 'Stopping window…',
  },
}
