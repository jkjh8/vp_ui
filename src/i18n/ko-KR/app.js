// 컴포넌트 폴더에 속하지 않는 앱 전역 문자열 (컴포저블/부트).
export default {
  playbackGuard: {
    title: '프리로딩 미완료',
    message:
      '이 플레이리스트가 아직 메모리에 로딩(프리로드)되지 않았습니다. 지금 재생하면 시작이 ' +
      '지연되거나 창 간 동기가 어긋날 수 있습니다. 계속 재생할까요? ' +
      '(취소하면 먼저 “로딩” 버튼으로 프리로드할 수 있습니다.)',
  },
  socket: {
    unknownFile: '알 수 없는 파일',
    windowSuffix: ' · 창 {id}',
    playFailed: '재생 실패',
  },
}
