<script setup>
// 장면 오디오 — 채널별 평면 리스트. 임베디드(영상 내장)와 추가 오디오를 구획 없이 한 리스트로,
// 한 행 = 소스 파일의 오디오 채널 1개. 컬럼: [소스파일] [볼륨] [뮤트] [출력+지연].
// 소스별 마스터는 없음(전역 마스터 볼륨은 MasterVolume.vue). 편집은 채널 gain/out/mute/name을
// 스키마(channels[])에 저장하며, 재생 중이면 라이브 적용(임베디드=set_deck_audio, 추가=재동기).
import { computed } from 'vue'
import { useStatusStore } from 'src/stores/useStatus'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useWindowAudio } from 'src/composables/useWindowAudio'
import DelayChip from './DelayChip.vue'

const { t } = useI18n()

const props = defineProps({
  scene: { type: Object, required: true },
  sceneIdx: { type: Number, required: true },
  // 클립 임베디드 패치: (win, patchObj) → 저장
  onPatchClip: { type: Function, required: true },
  // 추가 오디오 리스트 패치: (audiosArray) → 저장
  onPatchAudios: { type: Function, required: true },
  // 추가 오디오가 귀속된 창 (윈도우 모드 항목 = 그 레인의 창). null = 장면 오디오 → 전역 디바이스.
  audioWindow: { type: Number, default: null },
})

const { pStatus } = storeToRefs(useStatusStore())
const playlistStore = usePlaylistStore()

const clipWin = (c) => (Number.isInteger(c?.window) ? c.window : 0)
const srcCount = (file) => {
  const a = (file?.metadata?.streams || []).find((s) => s.codec_type === 'audio')
  return a?.channels > 0 ? a.channels : file ? 2 : 0
}
const hasAudio = (clip) => (clip?.metadata?.streams || []).some((s) => s.codec_type === 'audio')

// 출력 채널 옵션 (Mute + Ch1..N, 현재 오디오 디바이스 채널 수 기준)
const outputChannels = computed(() => {
  const dev = (pStatus.value.audioDevices || []).find((d) => d.deviceId === pStatus.value.audioDevice)
  return dev?.channels ?? 2
})
// 행별 출력 선택지: 임베디드 = 클립의 창, 추가 오디오 = audioWindow 의 디바이스 채널수
// (창마다 출력 디바이스가 다를 수 있음).
const { channelsForWindow } = useWindowAudio()
const optionsCache = computed(() => {
  const mk = (n) => [
    { label: t('playlists.sceneAudioList.mute'), value: -1 },
    ...Array.from({ length: n }, (_, i) => ({
      label: t('playlists.sceneAudioList.channelN', { n: i + 1 }),
      value: i,
    })),
  ]
  const byWin = new Map()
  return (win) => {
    const n = channelsForWindow(win)
    if (!byWin.has(n)) byWin.set(n, mk(n))
    return byWin.get(n)
  }
})
const outputOptionsFor = (row) =>
  optionsCache.value(row.kind === 'embedded' ? row.win : props.audioWindow)
const clampVol = (v) => Math.max(0, Math.min(100, Math.round(Number(v)) || 0))

// channels[] 정규화 (channels > legacy channel_map > 기본 항등). name 포함.
const buildChannels = (channels, legacyMap, n) =>
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
    return { out: c < outputChannels.value ? c : -1, volume: 100, muted: false, delay_ms: 0 }
  })

// 평면 행 목록: 임베디드(클립 오디오) + 추가 오디오, 각 소스 채널 1행.
const rows = computed(() => {
  const list = []
  const clips = props.scene?.clips || []
  const order = new Map((pStatus.value.windows || []).map((w, i) => [w.id, i]))
  const sortedClips = [...clips].sort((a, b) => (order.get(clipWin(a)) ?? 99) - (order.get(clipWin(b)) ?? 99))
  for (const clip of sortedClips) {
    if (!hasAudio(clip)) continue
    const n = srcCount(clip)
    const chs = buildChannels(clip.embedded_streams?.[0]?.channels, clip.channel_map, n)
    for (let c = 0; c < n; c++) {
      list.push({
        key: `emb-${clipWin(clip)}-${c}`,
        kind: 'embedded',
        win: clipWin(clip),
        clip,
        srcName: clip.filename || t('playlists.sceneAudioList.videoFallback'),
        chIdx: c,
        srcN: n,
        ch: chs[c],
        allChs: chs,
        first: c === 0,
      })
    }
  }
  const audios = props.scene?.audios || []
  audios.forEach((audio, ai) => {
    const n = srcCount(audio)
    const chs = buildChannels(audio.channels, audio.channel_map, n)
    for (let c = 0; c < n; c++) {
      list.push({
        key: `aud-${audio.id || ai}-${c}`,
        kind: 'extra',
        audioIdx: ai,
        audio,
        srcName: audio.filename || t('playlists.sceneAudioList.audioFallback'),
        chIdx: c,
        srcN: n,
        ch: chs[c],
        allChs: chs,
        first: c === 0,
      })
    }
  })
  return list
})

// ── 임베디드 채널 편집 ── (스트림 마스터는 전역 마스터가 대신하므로 항등 100/false 고정)
const persistEmbeddedChannels = (row, channels) => {
  props.onPatchClip(row.win, {
    volume: 100,
    muted: false,
    embedded_streams: [{ index: 0, volume: 100, muted: false, channels }],
  })
  // 재생 중이면 라이브 적용 (best-effort). window_id=이 클립의 창(멀티윈도우에서 대상 덱 지정).
  playlistStore.setDeckAudioLive({ window_id: row.win, streams: [{ index: 0, channels }] })
}
const editEmbeddedCh = (row, patch) => {
  const channels = row.allChs.map((ch, i) => (i === row.chIdx ? { ...ch, ...patch } : ch))
  persistEmbeddedChannels(row, channels)
}

// ── 추가 오디오 채널 편집 ──
const persistAudioChannels = (row, channels) => {
  const next = (props.scene.audios || []).map((a, i) =>
    i === row.audioIdx ? { ...a, volume: 100, muted: false, channels } : a,
  )
  props.onPatchAudios(next)
  // 재생 중이면 라이브 적용 (윈도우 모드는 persist가 syncTrackAudios를 안 타므로 직접 적용).
  if (row.audio?.id) playlistStore.setTrackAudioLive(row.audio.id, { channels })
}
const editAudioCh = (row, patch) => {
  const channels = row.allChs.map((ch, i) => (i === row.chIdx ? { ...ch, ...patch } : ch))
  persistAudioChannels(row, channels)
}

// 통합 편집 디스패치
const setVolume = (row, v) => {
  const volume = clampVol(v)
  row.kind === 'embedded' ? editEmbeddedCh(row, { volume }) : editAudioCh(row, { volume })
}
const toggleMute = (row) => {
  const muted = !row.ch.muted
  row.kind === 'embedded' ? editEmbeddedCh(row, { muted }) : editAudioCh(row, { muted })
}
const setOut = (row, out) => {
  out = Number(out)
  row.kind === 'embedded' ? editEmbeddedCh(row, { out }) : editAudioCh(row, { out })
}
const setDelay = (row, v) => {
  const delay_ms = Math.max(0, Math.round(Number(v)) || 0)
  row.kind === 'embedded' ? editEmbeddedCh(row, { delay_ms }) : editAudioCh(row, { delay_ms })
}
</script>

<template>
  <div class="scene-audio">
    <div v-if="rows.length === 0" class="text-caption text-muted q-pa-sm">
      {{ $t('playlists.sceneAudioList.noAudioChannels') }}
    </div>
    <table v-else class="audio-table">
      <thead>
        <tr>
          <th class="c-src">{{ $t('playlists.sceneAudioList.colSource') }}</th>
          <th class="c-vol">{{ $t('playlists.sceneAudioList.colVolume') }}</th>
          <th class="c-mute">{{ $t('playlists.sceneAudioList.mute') }}</th>
          <th class="c-out">{{ $t('playlists.sceneAudioList.colOutput') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.key" :class="{ 'row-first': row.first }">
          <td class="c-src">
            <span v-if="row.first" class="src-name ellipsis" :title="row.srcName">
              <q-icon :name="row.kind === 'embedded' ? 'movie' : 'music_note'" size="14px"
                :color="row.kind === 'embedded' ? 'blue-grey-6' : 'teal-6'" class="q-mr-xs" />{{ row.srcName }}
            </span>
          </td>
          <td class="c-vol">
            <input class="cell-num" type="number" min="0" max="100" :value="row.ch.volume"
              :disabled="row.ch.muted || row.ch.out < 0"
              @change="(e) => setVolume(row, e.target.value)" />
          </td>
          <td class="c-mute">
            <q-btn flat round dense size="sm" :color="row.ch.muted ? 'grey-5' : 'primary'"
              :icon="row.ch.muted ? 'volume_off' : 'volume_up'" @click="toggleMute(row)" />
          </td>
          <td class="c-out">
            <div class="row items-center no-wrap">
              <select class="cell-select" :value="row.ch.out" @change="(e) => setOut(row, e.target.value)">
                <option v-for="opt in outputOptionsFor(row)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <DelayChip v-if="row.ch.out >= 0" :model-value="row.ch.delay_ms || 0" :step="10" @save="(ms) => setDelay(row, ms)" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.scene-audio {
  padding: 4px 10px 8px;
}
.audio-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.audio-table th {
  text-align: left;
  color: var(--text-muted, #999);
  font-weight: 500;
  padding: 2px 6px;
  border-bottom: 1px solid var(--border);
}
.audio-table td {
  padding: 3px 6px;
  vertical-align: middle;
}
.row-first td {
  border-top: 1px solid var(--border);
}
.c-src { width: 40%; }
.c-vol { width: 14%; }
.c-mute { width: 8%; text-align: center; }
.c-out { width: 38%; }
.src-name {
  display: inline-block;
  max-width: 100%;
  color: var(--text-1);
  font-weight: 500;
}
.cell-num,
.cell-select {
  height: 1.9rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background-color: var(--surface-1);
  color: inherit;
  font-family: inherit;
  font-size: 12px;
  outline: none;
}
.cell-num { width: 3.2rem; padding: 0 4px; text-align: right; }
.cell-select { width: 100%; padding: 0 4px; }
.cell-num:focus,
.cell-select:focus { border-color: var(--accent); }
.cell-num:disabled { opacity: 0.5; }
</style>
