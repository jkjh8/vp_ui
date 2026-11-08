/**
 * 터미널(TCP) 외부제어 가이드 — Help 페이지 데이터 소스
 *
 * 실제 구현 기준(vp_app2):
 *  - 명령 레지스트리: src/api/terminal/commands.js  (이 문서의 단일 출처)
 *  - dispatcher     : src/api/terminal/index.js
 *  - TCP 서버       : src/tcp/index.js  (Simple 15000 / JSON 15001)
 *  - 이벤트/버전    : src/utils/tcpResponse.js
 *
 * 규약: 명령은 `domain.action` dot 네임스페이스(소문자). 모든 명령은 표준 응답 봉투를 돌려준다.
 */

export const terminalGuide = {
  overview: {
    title: 'VP App 터미널(TCP) 외부제어 가이드',
    description:
      'VP App은 두 개의 TCP 포트로 외부 제어 명령을 받습니다. 명령은 `domain.action` 네임스페이스이며, 각 명령은 줄바꿈(\\n)으로 구분합니다. 모든 명령은 표준 JSON 응답 봉투를 돌려줍니다.',
    protocolVersion: '2.0',
    version: '0.7.2',
    protocol: 'TCP · 줄바꿈(\\n) 구분',
    lastUpdated: '2026-09-21',
    ports: [
      {
        name: 'Simple 명령 포트',
        port: 15000,
        format: '쉼표 구분 텍스트',
        note: 'JSON( { 또는 [ 로 시작 )은 거부됩니다.',
      },
      {
        name: 'JSON 명령 포트',
        port: 15001,
        format: 'JSON 객체',
        note: '올바른 JSON이 아니면 거부됩니다.',
      },
    ],
    capabilityNote:
      '접속 직후 welcome 응답과 system.capabilities 명령으로 protocolVersion · 플레이어 features(multi_window/timeline/master_volume/live_source/live_ndi 등) · 지원 명령 목록을 확인할 수 있습니다. 라이브 입력 소스(source.*)와 창 귀속(window.setsource)은 플레이어 live_source 기능이, NDI는 live_ndi 기능이 필요합니다.',
  },

  commandFormat: [
    {
      type: 'simple',
      title: '간단한 명령어 형식',
      port: 15000,
      description:
        '쉼표로 구분된 텍스트. 명령 뒤에 값을 순서대로 붙입니다. Simple 포트(15000)로 전송.',
      format: 'domain.action[,value1[,value2]]',
      examples: [
        'player.play',
        'window.play,2,0',
        'window.setsource,2,cam-1',
        'layout.apply,1',
        'audio.mastervolume,50',
        'autostart.set,true',
      ],
    },
    {
      type: 'json',
      title: 'JSON 명령어 형식',
      port: 15001,
      description: 'JSON 객체로 명령 전달. 파라미터는 이름으로 지정. JSON 포트(15001)로 전송.',
      format: '{"command": "domain.action", ...}',
      examples: [
        '{"command": "player.play"}',
        '{"command": "window.setsource", "windowId": 2, "sourceId": "cam-1"}',
        '{"command": "source.create", "name": "Cam1", "kind": "rtsp", "uri": "rtsp://…"}',
        '{"command": "layout.apply", "id": 1}',
        '{"command": "autostart.set", "enabled": true}',
        '{"command": "system.capabilities"}',
      ],
    },
  ],

  // 명령어 분류 (Help 페이지 그룹핑). commands[].category 키와 매칭.
  categories: [
    { key: 'playback', label: '재생 제어', icon: 'play_circle' },
    { key: 'playlist', label: '플레이리스트', icon: 'queue_music' },
    { key: 'mode', label: '재생 모드', icon: 'swap_horiz' },
    { key: 'window', label: '창 제어 · 관리', icon: 'grid_view' },
    { key: 'source', label: '라이브 입력 소스', icon: 'sensors' },
    { key: 'layout', label: '화면 구성 프리셋', icon: 'dashboard_customize' },
    { key: 'preload', label: '프리로딩', icon: 'memory' },
    { key: 'audio', label: '오디오', icon: 'volume_up' },
    { key: 'display', label: '화면 · 배경', icon: 'fullscreen' },
    { key: 'repeat', label: '반복 모드', icon: 'repeat' },
    { key: 'timeline', label: '타임라인', icon: 'view_timeline' },
    { key: 'system', label: '시스템 · 자동 시작 · 자동 실행', icon: 'settings' },
    { key: 'query', label: '정보 조회', icon: 'search' },
  ],

  commands: [
    // ── 재생 제어 ────────────────────────────────────────────
    {
      name: 'player.play',
      category: 'playback',
      description: '재생 (windowId 지정 시 해당 창만, 윈도우 모드)',
      simple: 'player.play',
      json: '{"command": "player.play", "windowId": 2}',
      params: [{ name: 'windowId', type: 'number', required: false, description: '대상 창 (윈도우 모드)' }],
    },
    {
      name: 'player.pause',
      category: 'playback',
      description: '일시정지/재개 토글',
      simple: 'player.pause',
      json: '{"command": "player.pause"}',
      params: [{ name: 'windowId', type: 'number', required: false, description: '대상 창 (윈도우 모드)' }],
    },
    {
      name: 'player.stop',
      category: 'playback',
      description: '정지 (windowId 미지정 시 전체 정지)',
      simple: 'player.stop',
      json: '{"command": "player.stop"}',
      params: [{ name: 'windowId', type: 'number', required: false, description: '대상 창 (미지정=전체)' }],
    },
    {
      name: 'player.next',
      category: 'playback',
      description: '다음 트랙',
      simple: 'player.next',
      json: '{"command": "player.next"}',
      params: [{ name: 'windowId', type: 'number', required: false, description: '대상 창 (윈도우 모드)' }],
    },
    {
      name: 'player.prev',
      category: 'playback',
      description: '이전 트랙 (경과 3초↑면 현재 항목 처음으로)',
      simple: 'player.prev',
      json: '{"command": "player.prev"}',
      params: [{ name: 'windowId', type: 'number', required: false, description: '대상 창 (윈도우 모드)' }],
    },
    {
      name: 'player.seek',
      category: 'playback',
      description: '재생 위치(탐색) 변경',
      simple: 'player.seek,30000',
      json: '{"command": "player.seek", "time": 30000}',
      params: [
        { name: 'time', type: 'number', required: true, description: '위치(밀리초)' },
        { name: 'windowId', type: 'number', required: false, description: '대상 창 (윈도우 모드)' },
      ],
    },
    {
      name: 'player.fullscreen',
      category: 'playback',
      description: '전체화면 설정 (값 생략 시 토글)',
      simple: 'player.fullscreen,true',
      json: '{"command": "player.fullscreen", "value": true}',
      params: [{ name: 'value', type: 'boolean', required: false, description: '전체화면 여부 (생략 시 토글)' }],
    },

    // ── 플레이리스트 ─────────────────────────────────────────
    {
      name: 'playlist.play',
      category: 'playlist',
      description: '플레이리스트 재생 (id + 시작 트랙)',
      simple: 'playlist.play,1,2',
      json: '{"command": "playlist.play", "id": 1, "track": 2}',
      params: [
        { name: 'id', type: 'number', required: true, description: '플레이리스트 ID' },
        { name: 'track', type: 'number', required: false, description: '시작 트랙 인덱스 (기본 0)' },
      ],
    },
    {
      name: 'playlist.preload',
      category: 'playlist',
      description: '플레이리스트 전체를 메모리에 프리롤 (재생 안 함). 장면=전 트랙, 윈도우=다음 트랙만',
      simple: 'playlist.preload,1',
      json: '{"command": "playlist.preload", "id": 1}',
      params: [{ name: 'id', type: 'number', required: true, description: '플레이리스트 ID' }],
    },

    // ── 재생 모드 ────────────────────────────────────────────
    {
      name: 'mode.set',
      category: 'mode',
      description: '전역 작업 모드 설정. scene=전 창 락스텝 동기, window=창별 독립 재생/정지',
      simple: 'mode.set,window',
      json: '{"command": "mode.set", "mode": "window"}',
      params: [{ name: 'mode', type: 'string', required: true, description: 'scene | window' }],
    },
    {
      name: 'mode.switch',
      category: 'mode',
      description: '특정 플레이리스트의 타입 즉시 전환 (트랙 구조 변환)',
      simple: 'mode.switch,1,window',
      json: '{"command": "mode.switch", "playlistId": 1, "mode": "window"}',
      params: [
        { name: 'playlistId', type: 'number', required: true, description: '플레이리스트 ID' },
        { name: 'mode', type: 'string', required: true, description: 'scene | window' },
      ],
    },

    // ── 창별 제어 (윈도우 모드) ──────────────────────────────
    {
      name: 'window.play',
      category: 'window',
      description: '지정 창만 재생. playlistId 생략 시 현재 로드된 플레이리스트',
      simple: 'window.play,2,0',
      json: '{"command": "window.play", "windowId": 2, "index": 0, "playlistId": 1}',
      params: [
        { name: 'windowId', type: 'number', required: true, description: '대상 창 ID' },
        { name: 'index', type: 'number', required: false, description: '시작 항목 인덱스 (기본 0)' },
        { name: 'playlistId', type: 'number', required: false, description: '플레이리스트 ID (생략=현재)' },
      ],
    },
    {
      name: 'window.stop',
      category: 'window',
      description: '지정 창만 정지',
      simple: 'window.stop,2',
      json: '{"command": "window.stop", "windowId": 2}',
      params: [{ name: 'windowId', type: 'number', required: true, description: '대상 창 ID' }],
    },
    {
      name: 'window.next',
      category: 'window',
      description: '지정 창을 다음 항목으로',
      simple: 'window.next,2',
      json: '{"command": "window.next", "windowId": 2}',
      params: [{ name: 'windowId', type: 'number', required: true, description: '대상 창 ID' }],
    },
    {
      name: 'window.prev',
      category: 'window',
      description: '지정 창을 이전 항목으로',
      simple: 'window.prev,2',
      json: '{"command": "window.prev", "windowId": 2}',
      params: [{ name: 'windowId', type: 'number', required: true, description: '대상 창 ID' }],
    },
    // 창 관리(생성/수정/삭제)와 라이브 소스 귀속(setsource/clearsource)은 화면 구성 UI(Layouts)와
    // 동일한 REST 동작을 그대로 호출한다. 창 좌표/크기 편집은 복합값이라 JSON 포트 사용을 권장.
    {
      name: 'window.create',
      category: 'window',
      description: '출력 창 생성 (모니터/좌표/크기/비율/배경/z순서, 선택적 라이브 소스 귀속)',
      simple: 'window.create,창1,1,0,0,1920,1080',
      json: '{"command": "window.create", "monitorIndex": 1, "width": 1920, "height": 1080, "aspectMode": "letterbox"}',
      params: [
        { name: 'name', type: 'string', required: false, description: '창 이름 (생략 시 자동)' },
        { name: 'monitorIndex', type: 'number', required: false, description: '모니터 인덱스 (-1=주 모니터)' },
        { name: 'x', type: 'number', required: false, description: 'X (기본 0)' },
        { name: 'y', type: 'number', required: false, description: 'Y (기본 0)' },
        { name: 'width', type: 'number', required: false, description: '폭 (0=모니터 전체)' },
        { name: 'height', type: 'number', required: false, description: '높이 (0=모니터 전체)' },
        { name: 'aspectMode', type: 'string', required: false, description: 'letterbox | crop | stretch' },
        { name: 'backgroundColor', type: 'string', required: false, description: '배경색 #rrggbb' },
        { name: 'zOrder', type: 'number', required: false, description: '겹칠 때 쌓임 순서 (클수록 앞)' },
        { name: 'sourceId', type: 'string', required: false, description: '귀속할 라이브 소스 ID' },
        { name: 'audioOnly', type: 'boolean', required: false, description: 'true = 화면 송출 없는 오디오 전용 창' },
      ],
    },
    {
      name: 'window.update',
      category: 'window',
      description: '출력 창 수정 (지정한 필드만 변경)',
      simple: 'window.update,2,0,0,1280,720',
      json: '{"command": "window.update", "id": 2, "width": 1280, "height": 720}',
      params: [
        { name: 'id', type: 'number', required: true, description: '대상 창 ID' },
        { name: 'monitorIndex', type: 'number', required: false, description: '모니터 인덱스' },
        { name: 'x', type: 'number', required: false, description: 'X' },
        { name: 'y', type: 'number', required: false, description: 'Y' },
        { name: 'width', type: 'number', required: false, description: '폭' },
        { name: 'height', type: 'number', required: false, description: '높이' },
        { name: 'aspectMode', type: 'string', required: false, description: 'letterbox | crop | stretch' },
        { name: 'backgroundColor', type: 'string', required: false, description: '배경색 #rrggbb' },
        { name: 'zOrder', type: 'number', required: false, description: '쌓임 순서' },
        { name: 'audioOnly', type: 'boolean', required: false, description: '오디오 전용 전환 (창 재생성)' },
      ],
    },
    {
      name: 'window.delete',
      category: 'window',
      description: '출력 창 삭제 (그 창을 참조하던 클립도 정리)',
      simple: 'window.delete,2',
      json: '{"command": "window.delete", "id": 2}',
      params: [{ name: 'id', type: 'number', required: true, description: '대상 창 ID' }],
    },
    {
      name: 'window.setsource',
      category: 'window',
      description: '지정 창에 라이브 입력 소스를 귀속 (플레이리스트와 무관한 지속 레이어로 재생)',
      simple: 'window.setsource,2,cam-1',
      json: '{"command": "window.setsource", "windowId": 2, "sourceId": "cam-1"}',
      params: [
        { name: 'windowId', type: 'number', required: true, description: '대상 창 ID' },
        { name: 'sourceId', type: 'string', required: true, description: '라이브 소스 ID (source.list로 조회)' },
      ],
    },
    {
      name: 'window.clearsource',
      category: 'window',
      description: '지정 창의 라이브 소스 귀속 해제',
      simple: 'window.clearsource,2',
      json: '{"command": "window.clearsource", "windowId": 2}',
      params: [{ name: 'windowId', type: 'number', required: true, description: '대상 창 ID' }],
    },

    // ── 라이브 입력 소스 (RTP/RTSP/SRT/NDI) ──────────────────
    {
      name: 'source.create',
      category: 'source',
      description: '라이브 소스 생성. 복합 값(rtp 하위 필드)은 JSON 포트 권장. 실제 표시는 window.setsource',
      simple: 'source.create,Cam1,rtsp,rtsp://10.0.0.5/stream',
      json: '{"command": "source.create", "name": "Cam1", "kind": "rtsp", "uri": "rtsp://10.0.0.5/stream"}',
      params: [
        { name: 'name', type: 'string', required: true, description: '소스 이름' },
        { name: 'kind', type: 'string', required: false, description: 'rtsp | srt | rtp | ndi (기본 rtsp)' },
        { name: 'uri', type: 'string', required: false, description: 'rtsp:// 또는 srt:// 주소 (rtsp/srt)' },
        { name: 'ndi_name', type: 'string', required: false, description: 'NDI 송출기 이름 (ndi)' },
        { name: 'url_address', type: 'string', required: false, description: 'NDI ip:port (ndi)' },
        { name: 'latency_ms', type: 'number', required: false, description: '지터버퍼 지연(ms, 기본 200)' },
        { name: 'has_audio', type: 'boolean', required: false, description: '오디오 포함 여부' },
        { name: 'rtp', type: 'object', required: false, description: '순수 RTP 설정 {address,port,encoding_name,…} — JSON 포트 전용' },
      ],
    },
    {
      name: 'source.update',
      category: 'source',
      description: '라이브 소스 수정 (지정 필드만). 이 소스를 귀속한 창은 자동으로 라이브 갱신',
      simple: 'source.update,cam-1,Cam1',
      json: '{"command": "source.update", "id": "cam-1", "uri": "rtsp://10.0.0.6/stream"}',
      params: [
        { name: 'id', type: 'string', required: true, description: '소스 ID' },
        { name: 'name', type: 'string', required: false, description: '이름' },
        { name: 'kind', type: 'string', required: false, description: 'rtsp | srt | rtp | ndi' },
        { name: 'uri', type: 'string', required: false, description: 'rtsp:// 또는 srt:// 주소' },
        { name: 'latency_ms', type: 'number', required: false, description: '지연(ms)' },
        { name: 'has_audio', type: 'boolean', required: false, description: '오디오 포함 여부' },
      ],
    },
    {
      name: 'source.delete',
      category: 'source',
      description: '라이브 소스 삭제 (귀속된 창은 자동 해제 후 삭제)',
      simple: 'source.delete,cam-1',
      json: '{"command": "source.delete", "id": "cam-1"}',
      params: [{ name: 'id', type: 'string', required: true, description: '소스 ID' }],
    },

    // ── 화면 구성 프리셋 (레이아웃) ──────────────────────────
    {
      name: 'layout.save',
      category: 'layout',
      description: '현재 출력 창 배치를 새 프리셋으로 저장',
      simple: 'layout.save,공연 A',
      json: '{"command": "layout.save", "name": "공연 A"}',
      params: [{ name: 'name', type: 'string', required: false, description: '프리셋 이름 (생략 시 자동)' }],
    },
    {
      name: 'layout.apply',
      category: 'layout',
      description: '프리셋 적용 — 전 창을 프리셋 배치로 교체 (창별 라이브 소스 귀속 포함)',
      simple: 'layout.apply,1',
      json: '{"command": "layout.apply", "id": 1}',
      params: [{ name: 'id', type: 'number', required: true, description: '프리셋 ID (layout.list로 조회)' }],
    },
    {
      name: 'layout.update',
      category: 'layout',
      description: '기존 프리셋을 현재 배치로 덮어쓰기',
      simple: 'layout.update,1',
      json: '{"command": "layout.update", "id": 1}',
      params: [{ name: 'id', type: 'number', required: true, description: '프리셋 ID' }],
    },
    {
      name: 'layout.rename',
      category: 'layout',
      description: '프리셋 이름 변경',
      simple: 'layout.rename,1,공연 B',
      json: '{"command": "layout.rename", "id": 1, "name": "공연 B"}',
      params: [
        { name: 'id', type: 'number', required: true, description: '프리셋 ID' },
        { name: 'name', type: 'string', required: true, description: '새 이름' },
      ],
    },
    {
      name: 'layout.delete',
      category: 'layout',
      description: '프리셋 삭제',
      simple: 'layout.delete,1',
      json: '{"command": "layout.delete", "id": 1}',
      params: [{ name: 'id', type: 'number', required: true, description: '프리셋 ID' }],
    },

    // ── 프리로딩 ─────────────────────────────────────────────
    {
      name: 'preload.config',
      category: 'preload',
      description: '프리롤 설정. lookahead=창당 미리읽기 트랙 수, maxDecks=전역 덱 상한',
      simple: 'preload.config,2,8',
      json: '{"command": "preload.config", "lookahead": 2, "maxDecks": 8}',
      params: [
        { name: 'lookahead', type: 'number', required: true, description: '미리읽기 트랙 수' },
        { name: 'maxDecks', type: 'number', required: true, description: '전역 덱 상한' },
      ],
    },

    // ── 오디오 ───────────────────────────────────────────────
    {
      name: 'audio.setdevice',
      category: 'audio',
      description: '오디오 장치 설정',
      simple: 'audio.setdevice,스피커',
      json: '{"command": "audio.setdevice", "device": "스피커"}',
      params: [{ name: 'device', type: 'string', required: true, description: '장치명' }],
    },
    {
      name: 'audio.mastervolume',
      category: 'audio',
      description: '마스터 볼륨 설정 (0~100)',
      simple: 'audio.mastervolume,50',
      json: '{"command": "audio.mastervolume", "value": 50}',
      params: [{ name: 'value', type: 'number', required: true, description: '볼륨 0~100' }],
    },
    {
      name: 'audio.channeldelays',
      category: 'audio',
      description: '출력 채널별 오디오 지연(ms) 설정 (값 여러 개 = 채널 순서)',
      simple: 'audio.channeldelays,100,50,0',
      json: '{"command": "audio.channeldelays", "delays": [100, 50, 0]}',
      params: [{ name: 'delays', type: 'number[]', required: true, description: '채널별 지연(ms) 배열' }],
    },

    // ── 화면 (디스플레이 / 배경) ─────────────────────────────
    {
      name: 'display.set',
      category: 'display',
      description: '전역 디스플레이 배치 (모니터/좌표/크기/비율)',
      simple: 'display.set,0,0,0,1920,1080,letterbox',
      json: '{"command": "display.set", "monitorIndex": 0, "width": 1920, "height": 1080, "aspectMode": "letterbox"}',
      params: [
        { name: 'monitorIndex', type: 'number', required: true, description: '모니터 인덱스 (-1=주 모니터)' },
        { name: 'x', type: 'number', required: false, description: 'X (기본 0)' },
        { name: 'y', type: 'number', required: false, description: 'Y (기본 0)' },
        { name: 'width', type: 'number', required: false, description: '폭 (0=모니터 전체)' },
        { name: 'height', type: 'number', required: false, description: '높이 (0=모니터 전체)' },
        { name: 'aspectMode', type: 'string', required: false, description: 'letterbox | crop | stretch' },
      ],
    },
    {
      name: 'display.background',
      category: 'display',
      description: '배경색 설정 (#rrggbb)',
      simple: 'display.background,#000000',
      json: '{"command": "display.background", "color": "#000000"}',
      params: [{ name: 'color', type: 'string', required: true, description: '색상 #rrggbb' }],
    },

    // ── 반복 ─────────────────────────────────────────────────
    {
      name: 'repeat.set',
      category: 'repeat',
      description:
        '반복 모드 설정 (none/all/repeat_one, 생략 시 토글). 플레이리스트 모드가 아닐 때는 repeat_one 불가. windowId 지정 시 그 창만(윈도우 모드) 전역과 독립 설정',
      simple: 'repeat.set,all',
      json: '{"command": "repeat.set", "mode": "all", "windowId": 1}',
      params: [
        { name: 'mode', type: 'string', required: false, description: 'none | all | repeat_one' },
        { name: 'windowId', type: 'number', required: false, description: '창 ID (윈도우 모드 창별 반복)' },
      ],
    },

    // ── 타임라인 ─────────────────────────────────────────────
    {
      name: 'timeline.play',
      category: 'timeline',
      description: '타임라인 재생 (선택적 시작 위치 ms). 플레이어 timeline 기능 필요',
      simple: 'timeline.play,1,5000',
      json: '{"command": "timeline.play", "timelineId": "1", "ms": 5000}',
      params: [
        { name: 'timelineId', type: 'string', required: true, description: '타임라인 ID' },
        { name: 'ms', type: 'number', required: false, description: '시작 위치(ms)' },
      ],
    },
    {
      name: 'timeline.pause',
      category: 'timeline',
      description: '타임라인 일시정지/재개 토글',
      simple: 'timeline.pause',
      json: '{"command": "timeline.pause"}',
      params: [],
    },
    {
      name: 'timeline.stop',
      category: 'timeline',
      description: '타임라인 정지',
      simple: 'timeline.stop',
      json: '{"command": "timeline.stop"}',
      params: [],
    },
    {
      name: 'timeline.seek',
      category: 'timeline',
      description: '타임라인 위치 이동 (ms)',
      simple: 'timeline.seek,5000',
      json: '{"command": "timeline.seek", "ms": 5000}',
      params: [{ name: 'ms', type: 'number', required: true, description: '위치(ms)' }],
    },

    // ── 시스템 · 자동 시작 · 자동 실행 ───────────────────────
    {
      name: 'startonplay.set',
      category: 'system',
      description: '프로그램 시작 시 자동 재생 설정 (+ 재생할 플레이리스트 ID)',
      simple: 'startonplay.set,true,1',
      json: '{"command": "startonplay.set", "enabled": true, "playlistId": 1}',
      params: [
        { name: 'enabled', type: 'boolean', required: false, description: '사용 여부 (생략=현재 설정 반환)' },
        { name: 'playlistId', type: 'number', required: false, description: '자동 재생 플레이리스트 ID' },
      ],
    },
    {
      name: 'autostart.set',
      category: 'system',
      description: 'Windows 시작(로그온) 시 앱 자동 실행 설정 (작업 스케줄러 "VP App"). Windows 전용',
      simple: 'autostart.set,true',
      json: '{"command": "autostart.set", "enabled": true}',
      params: [
        { name: 'enabled', type: 'boolean', required: false, description: '사용 여부 (생략=현재 설정 반환)' },
      ],
    },

    // ── 정보 조회 ────────────────────────────────────────────
    {
      name: 'system.status',
      category: 'query',
      description: '현재 상태 스냅샷 조회 (모드/재생/볼륨/파일 등)',
      simple: 'system.status',
      json: '{"command": "system.status"}',
      params: [],
    },
    {
      name: 'system.version',
      category: 'query',
      description: '앱/프로토콜 버전 조회',
      simple: 'system.version',
      json: '{"command": "system.version"}',
      params: [],
    },
    {
      name: 'system.capabilities',
      category: 'query',
      description: '프로토콜 버전 + 플레이어 기능(features) + 지원 명령 목록 조회',
      simple: 'system.capabilities',
      json: '{"command": "system.capabilities"}',
      params: [],
    },
    {
      name: 'mode.get',
      category: 'query',
      description: '현재 전역 작업 모드 조회',
      simple: 'mode.get',
      json: '{"command": "mode.get"}',
      params: [],
    },
    {
      name: 'preload.get',
      category: 'query',
      description: '프리롤 설정 및 진척 상태 조회',
      simple: 'preload.get',
      json: '{"command": "preload.get"}',
      params: [],
    },
    {
      name: 'window.list',
      category: 'query',
      description: '출력 창 목록 조회 (설정 창 + 플레이어 실제 창)',
      simple: 'window.list',
      json: '{"command": "window.list"}',
      params: [],
    },
    {
      name: 'display.list',
      category: 'query',
      description: '감지된 모니터 목록 조회',
      simple: 'display.list',
      json: '{"command": "display.list"}',
      params: [],
    },
    {
      name: 'repeat.get',
      category: 'query',
      description: '현재 반복 모드 및 허용 모드 조회',
      simple: 'repeat.get',
      json: '{"command": "repeat.get"}',
      params: [],
    },
    {
      name: 'audio.listdevices',
      category: 'query',
      description: '사용 가능한 오디오 장치 목록',
      simple: 'audio.listdevices',
      json: '{"command": "audio.listdevices"}',
      params: [],
    },
    {
      name: 'audio.getdevice',
      category: 'query',
      description: '현재 선택된 오디오 장치',
      simple: 'audio.getdevice',
      json: '{"command": "audio.getdevice"}',
      params: [],
    },
    {
      name: 'audio.getmastervolume',
      category: 'query',
      description: '현재 마스터 볼륨 조회',
      simple: 'audio.getmastervolume',
      json: '{"command": "audio.getmastervolume"}',
      params: [],
    },
    {
      name: 'startonplay.get',
      category: 'query',
      description: '현재 자동 시작 설정 조회',
      simple: 'startonplay.get',
      json: '{"command": "startonplay.get"}',
      params: [],
    },
    {
      name: 'autostart.get',
      category: 'query',
      description: '현재 자동 실행(로그온 시) 설정 조회',
      simple: 'autostart.get',
      json: '{"command": "autostart.get"}',
      params: [],
    },
    {
      name: 'source.list',
      category: 'query',
      description: '라이브 입력 소스 목록 조회',
      simple: 'source.list',
      json: '{"command": "source.list"}',
      params: [],
    },
    {
      name: 'source.get',
      category: 'query',
      description: '특정 라이브 소스 조회',
      simple: 'source.get,cam-1',
      json: '{"command": "source.get", "id": "cam-1"}',
      params: [{ name: 'id', type: 'string', required: true, description: '소스 ID' }],
    },
    {
      name: 'layout.list',
      category: 'query',
      description: '화면 구성 프리셋 목록 조회 (현재 배치와 일치하는 activePresetId 포함)',
      simple: 'layout.list',
      json: '{"command": "layout.list"}',
      params: [],
    },
    {
      name: 'playlist.list',
      category: 'query',
      description: '플레이리스트 목록 조회 (간소화 트랙 정보 포함)',
      simple: 'playlist.list',
      json: '{"command": "playlist.list"}',
      params: [],
    },
    {
      name: 'playlist.get',
      category: 'query',
      description: '특정 플레이리스트 조회',
      simple: 'playlist.get,1',
      json: '{"command": "playlist.get", "id": 1}',
      params: [{ name: 'id', type: 'number', required: true, description: '플레이리스트 ID' }],
    },
    {
      name: 'files.list',
      category: 'query',
      description: '전체 파일 목록 조회',
      simple: 'files.list',
      json: '{"command": "files.list"}',
      params: [],
    },
  ],

  // 서버 → 전 클라이언트 브로드캐스트 이벤트. 형식: {"command":"event","data":{"eventType":"...",...}}
  events: [
    { type: 'playerReady', description: '플레이어 준비 완료' },
    { type: 'playStarted', description: '재생 시작' },
    { type: 'playPaused', description: '일시정지' },
    { type: 'playStopped', description: '정지' },
    { type: 'nextTrack', description: '다음 트랙으로 이동' },
    { type: 'prevTrack', description: '이전 트랙으로 이동' },
    { type: 'trackEnded', description: '트랙 종료 (다음 트랙으로 진행)' },
    { type: 'endReached', description: '재생 목록/미디어 끝 도달' },
    { type: 'mediaChanged', description: '재생 중인 미디어 변경' },
    { type: 'fullscreenChanged', description: '전체화면 상태 변경' },
    { type: 'audioDevicesUpdated', description: '오디오 장치 목록 갱신' },
    { type: 'playbackModeChanged', description: '전역 작업 모드(scene/window) 변경' },
    { type: 'windowStopped', description: '특정 창 정지' },
    { type: 'repeatChanged', description: '반복 모드 변경' },
  ],

  // 표준 응답/이벤트 봉투 (src/utils/tcpResponse.js)
  responseFormat: {
    success: `{
  "timestamp": "2026-08-07T12:00:00.000Z",
  "success": true,
  "command": "mode.set",
  "message": "Playback mode: window",
  "data": { "playbackMode": "window" }
}`,
    error: `{
  "timestamp": "2026-08-07T12:00:00.000Z",
  "success": false,
  "command": "window.play",
  "error": {
    "code": "EXECUTION_ERROR",
    "message": "Failed to play window (player not connected or not window mode)",
    "details": "..."
  }
}`,
    event: `{
  "timestamp": "2026-08-07T12:00:00.000Z",
  "success": true,
  "command": "event",
  "message": "Event: playStarted",
  "data": { "eventType": "playStarted", "fileId": 1, "filename": "video.mp4" }
}`,
  },

  // 클라이언트 예제 (Node.js · Python)
  examples: [
    {
      lang: 'Node.js',
      title: 'Node.js 클라이언트',
      code: `const net = require('net')

// 1) Simple 포트(15000): 쉼표 구분 텍스트 명령
const simple = net.connect(15000, 'localhost', () => {
  simple.write('mode.set,window\\n')
  simple.write('window.play,2,0\\n')
  simple.write('audio.mastervolume,50\\n')
})

// 2) JSON 포트(15001): JSON 객체 명령
const json = net.connect(15001, 'localhost', () => {
  json.write(JSON.stringify({ command: 'system.capabilities' }) + '\\n')
  json.write(JSON.stringify({ command: 'playlist.play', id: 1, track: 0 }) + '\\n')

  // 라이브 스트리밍: 소스 생성 → 창 2에 귀속 (지속 레이어)
  json.write(JSON.stringify({ command: 'source.create', name: 'Cam1', kind: 'rtsp', uri: 'rtsp://10.0.0.5/stream' }) + '\\n')
  // 응답의 data.source.id 를 받아 window.setsource 로 귀속 (아래 data 핸들러 참고)
})

// 서버 응답(모든 명령) 및 이벤트 브로드캐스트 수신
json.on('data', (buf) => {
  for (const line of buf.toString().split('\\n').filter(Boolean)) {
    console.log('수신:', JSON.parse(line))
  }
})`,
    },
    {
      lang: 'Python',
      title: 'Python 클라이언트',
      code: `import socket, json

# 1) Simple 포트(15000): 쉼표 구분 텍스트 명령
s = socket.create_connection(('localhost', 15000))
for cmd in ['mode.set,window', 'window.play,2,0', 'audio.mastervolume,50']:
    s.sendall((cmd + '\\n').encode())

# 2) JSON 포트(15001): JSON 객체 명령
j = socket.create_connection(('localhost', 15001))
def send(obj):
    j.sendall((json.dumps(obj) + '\\n').encode())

send({'command': 'system.capabilities'})
send({'command': 'playlist.play', 'id': 1, 'track': 0})

# 라이브 스트리밍: 소스 생성 → 창 2에 귀속 (응답의 data.source.id 사용)
send({'command': 'source.create', 'name': 'Cam1', 'kind': 'rtsp', 'uri': 'rtsp://10.0.0.5/stream'})
# send({'command': 'window.setsource', 'windowId': 2, 'sourceId': '<위 응답 id>'})

# 서버 응답(모든 명령) 및 이벤트 브로드캐스트 수신
buf = ''
while True:
    buf += j.recv(4096).decode()
    while '\\n' in buf:
        line, buf = buf.split('\\n', 1)
        if line:
            print('수신:', json.loads(line))`,
    },
  ],

  troubleshooting: [
    {
      issue: '연결이 거부됨',
      solution:
        '서버가 실행 중인지, 사용하려는 포트(Simple 15000 / JSON 15001)가 열려 있는지 확인하세요.',
    },
    {
      issue: '"JSON format not allowed" 오류',
      solution: 'Simple 포트(15000)에는 JSON을 보낼 수 없습니다. JSON 명령은 15001 포트로 보내세요.',
    },
    {
      issue: '"Invalid JSON format" 오류',
      solution:
        'JSON 포트(15001)에는 단순 텍스트 명령을 보낼 수 없습니다. 올바른 JSON을 보내거나 단순 명령은 15000 포트로 보내세요.',
    },
    {
      issue: '"UNKNOWN_COMMAND" 오류',
      solution:
        '명령 이름을 확인하세요. system.capabilities로 지원 명령 목록을 조회할 수 있습니다.',
    },
    {
      issue: '창/타임라인 명령이 동작하지 않음',
      solution:
        '멀티 윈도우·타임라인은 플레이어 기능(features)에 의존합니다. system.capabilities의 features에 multi_window/timeline이 있는지 확인하세요.',
    },
    {
      issue: '라이브 소스(window.setsource)가 화면에 안 나옴',
      solution:
        '① system.capabilities의 features에 live_source(NDI는 live_ndi)가 있는지, ② source.get으로 주소/코덱이 맞는지, ③ 대상 창이 실제 존재하는지(window.list) 확인하세요. RTSP/SRT는 uri, 순수 RTP는 rtp 필드, NDI는 ndi_name/url_address가 필요합니다.',
    },
    {
      issue: 'source.create의 rtp 하위 설정이 반영되지 않음',
      solution:
        'address/port/encoding_name 같은 rtp 하위 필드는 중첩 객체라 Simple 포트(쉼표)로 전달할 수 없습니다. JSON 포트(15001)에서 "rtp": { … } 형태로 보내세요.',
    },
    {
      issue: '자동 실행(autostart)이 켜지지 않음',
      solution:
        'autostart는 사용자별 레지스트리 Run 키(HKCU\\…\\Run, 값 "VP App")로 로그온 시 실행됩니다. Windows에서만 지원되며 관리자 권한은 필요 없습니다. 구버전이 만든 작업 스케줄러 "VP App" 작업이 남아 있으면 중복 실행될 수 있으나, 단일 인스턴스 보호(:3000)로 두 번째 실행은 즉시 종료됩니다.',
    },
    {
      issue: '명령이 실행되지 않음',
      solution: '각 명령 끝에 줄바꿈(\\n)이 포함됐는지, 포트별 형식(Simple/JSON)이 맞는지 확인하세요.',
    },
  ],
}

export default terminalGuide
