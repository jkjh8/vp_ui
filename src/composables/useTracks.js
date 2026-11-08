// 플레이리스트 트랙의 영속 형태 변환 헬퍼
//
// 서버는 GET 시 트랙을 파일 문서로 하이드레이션해서 주지만(파일명/썸네일/메타데이터 포함),
// 저장(PUT) 시에는 영속 필드만 보내야 한다 — 파일 문서 필드를 다시 저장하면 DB가 비대해지고,
// 영속 필드를 빠뜨리면 라우팅/시간 설정이 소실된다.

/** 하이드레이션된 추가 오디오 → 저장 형태 (filename/path/metadata 등 파일 필드 제거) */
export function toPersistedAudio(audio) {
  return {
    id: audio.id, // 없으면 서버가 부여
    uuid: audio.uuid,
    volume: audio.volume ?? 100, // 마스터
    channel_map: Array.isArray(audio.channel_map) ? audio.channel_map : null, // 레거시
    channels: Array.isArray(audio.channels) ? audio.channels : null, // 채널별 [{out,volume,muted}]
    muted: audio.muted ?? false, // 마스터
    loop: audio.loop ?? false,
    delay_ms: Number.isFinite(audio.delay_ms) ? audio.delay_ms : 0, // 오디오 트랙별 시작 지연(ms)
  }
}

/** 하이드레이션된 클립(창별 동영상) → 저장 형태. 추가 오디오는 장면 단위로 분리되어 여기 없음
 *  (임베디드 오디오 설정 embedded_streams/volume/muted/channel_map은 영상에 종속되므로 유지). */
export function toPersistedClip(clip) {
  return {
    window: Number.isInteger(clip.window) ? clip.window : 0,
    uuid: clip.uuid,
    time: clip.time || 0,
    delay_ms: Number.isFinite(clip.delay_ms) ? clip.delay_ms : 0,
    volume: clip.volume ?? 100,
    channel_map: Array.isArray(clip.channel_map) ? clip.channel_map : null,
    muted: clip.muted ?? false,
    embedded_streams: Array.isArray(clip.embedded_streams) ? clip.embedded_streams : null,
  }
}

/** 하이드레이션된 트랙(장면) → playlists.db tracks[] 저장 형태.
 *  장면 = { clips: [영상 클립...], audios: [추가 오디오 트랙...] }. 오디오는 장면 단위 별도 리스트.
 *  레거시: 플랫 트랙은 1클립 장면으로, 클립에 있던 audios는 장면 audios로 승격. */
export function toPersistedTrack(track) {
  const clips = Array.isArray(track?.clips) ? track.clips : track?.uuid ? [track] : []
  const sceneAudios = Array.isArray(track?.audios)
    ? track.audios
    : clips.flatMap((c) => (Array.isArray(c.audios) ? c.audios : [])) // 레거시 클립 audios 승격
  const out = { clips: clips.map(toPersistedClip), audios: sceneAudios.map(toPersistedAudio) }
  // 장면 이름(선택) — 있을 때만 저장. 재정렬/추가/삭제로 전체 tracks를 PUT해도 이름이 소실되지 않게.
  const name = typeof track?.name === 'string' ? track.name.trim().slice(0, 40) : ''
  if (name) out.name = name
  return out
}

/** 윈도우 모드 항목(단일 창 클립 + 자기 오디오) → 저장 형태 (평면).
 *  하이드레이션된 트랙({clips:[clip], audios}) 또는 평면 클립 어느 쪽이든 받는다.
 *  클립 필드 + audios를 한 항목으로 평탄화해 저장한다 (mode:'window' 플레이리스트의 tracks[]). */
export function toPersistedWindowItem(track) {
  const clip = Array.isArray(track?.clips) ? track.clips[0] || {} : track || {}
  const audios = Array.isArray(track?.audios)
    ? track.audios
    : Array.isArray(clip?.audios)
      ? clip.audios
      : []
  // 오디오 전용 항목(영상 없음)은 클립에 window가 없으므로 항목의 window를 폴백으로 사용해 레인 유지.
  const window = Number.isInteger(clip.window)
    ? clip.window
    : Number.isInteger(track?.window)
      ? track.window
      : 0
  return {
    window,
    uuid: clip.uuid ?? null, // 오디오 전용 항목은 영상 uuid 없음
    time: clip.time || 0,
    delay_ms: Number.isFinite(clip.delay_ms) ? clip.delay_ms : 0,
    volume: clip.volume ?? 100,
    muted: clip.muted ?? false,
    channel_map: Array.isArray(clip.channel_map) ? clip.channel_map : null,
    embedded_streams: Array.isArray(clip.embedded_streams) ? clip.embedded_streams : null,
    audios: audios.map(toPersistedAudio),
  }
}

export function toPersistedWindowTracks(tracks) {
  return (Array.isArray(tracks) ? tracks : [])
    .filter((t) => {
      const clip = Array.isArray(t?.clips) ? t.clips[0] : t
      const audios = Array.isArray(t?.audios) ? t.audios : []
      // 영상이 있거나(clip.uuid) 오디오만 있어도(audio.uuid) 유지 — 오디오 전용 항목 허용.
      return (clip && clip.uuid) || audios.some((a) => a && a.uuid)
    })
    .map(toPersistedWindowItem)
}
