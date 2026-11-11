// 오디오 소스(영상 내장 / 추가 오디오)의 채널 설정 해석 — 리스트(SceneAudioList)와 트랙 편집 팝업의
// 상태 요약이 같은 기본값 규칙을 쓰도록 공용화.

/** 소스 파일의 오디오 채널 수 (메타데이터 없으면 2). file이 없으면 0 */
export const srcChannelCount = (file) => {
  const a = (file?.metadata?.streams || []).find((s) => s.codec_type === 'audio')
  return a?.channels > 0 ? a.channels : file ? 2 : 0
}

/** 영상에 내장 오디오가 있는지 */
export const hasEmbeddedAudio = (clip) =>
  (clip?.metadata?.streams || []).some((s) => s.codec_type === 'audio')

/** channels[] 정규화 (channels > legacy channel_map > 기본 항등). outCount = 출력 디바이스 채널 수 */
export const normalizeChannels = (channels, legacyMap, n, outCount) =>
  Array.from({ length: n }, (_, c) => {
    const ch = Array.isArray(channels) ? channels[c] : null
    if (ch) {
      return {
        out: Number.isInteger(ch.out) ? ch.out : -1,
        volume: ch.volume ?? 100,
        muted: ch.muted === true,
        delay_ms: Number.isFinite(ch.delay_ms) ? ch.delay_ms : 0,
      }
    }
    if (Array.isArray(legacyMap) && legacyMap[c] != null)
      return { out: legacyMap[c], volume: 100, muted: false, delay_ms: 0 }
    return { out: c < outCount ? c : -1, volume: 100, muted: false, delay_ms: 0 }
  })

/** 소스의 현재 채널 설정. kind: 'embedded'(영상 클립) | 'extra'(추가 오디오) */
export const sourceChannels = (src, kind, outCount) => {
  const n = srcChannelCount(src)
  return kind === 'embedded'
    ? normalizeChannels(src?.embedded_streams?.[0]?.channels, src?.channel_map, n, outCount)
    : normalizeChannels(src?.channels, src?.channel_map, n, outCount)
}
