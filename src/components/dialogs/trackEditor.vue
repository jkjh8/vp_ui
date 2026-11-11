<script setup>
// 트랙(장면/윈도우 항목) 추가·수정 통합 팝업 — 영상과 오디오를 한 팝업에서 함께 구성한다.
// 추가된 파일만 리스트로 보이고, 파일은 "선택/추가" 버튼으로 여는 파일 선택 팝업(addTracks)에서 고른다.
// 영상이나 오디오 중 하나만 있어도 저장 가능. 채널별 볼륨/뮤트 등 세부 오디오 설정은 리스트(SceneAudioList)에서.
// 반환(onOk): { clips: [clip...], audios: [audio...], window } — 기존 항목의 설정(지연/볼륨/라우팅)은 보존.
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { ref, computed, onMounted } from 'vue'
import { useApiStore } from 'src/stores/useApi'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import addTracks from './addTracks.vue'
import audioChannelsDialog from './audioChannelsDialog.vue'
import { hasEmbeddedAudio, sourceChannels } from 'src/composables/useAudioChannels'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const $q = useQuasar()
const { t } = useI18n()

const props = defineProps({
  playlist: { type: Object, default: null },
  // 'scene' = 창별 영상 슬롯 여러 개, 'window' = 한 창의 단일 항목(영상 0~1개)
  mode: { type: String, default: 'scene' },
  // 수정할 트랙 (하이드레이션 형태). null = 새 트랙
  track: { type: Object, default: null },
  // 윈도우 모드 레인. null이면 팝업에서 창을 고른다 (헤더의 "트랙 추가")
  windowId: { type: Number, default: null },
  // 열자마자 파일 선택 팝업 띄우기: 'video'(focusWindow 창) | 'audio' | null
  autoPick: { type: String, default: null },
  focusWindow: { type: Number, default: null },
})

const { getAddr } = useApiStore()
const { pStatus } = storeToRefs(useStatusStore())

const windows = computed(() =>
  (pStatus.value.windows || []).map((w) => ({ id: w.id, name: w.name, audioOnly: !!w.audioOnly })),
)
const isAudioWin = (id) => windows.value.some((w) => w.id === id && w.audioOnly)
// 오디오 전용 창은 음원(또는 영상의 오디오)을 클립으로 받는다. 일반 창은 영상/이미지.
const clipMimeFilter = (id) => (isAudioWin(id) ? ['audio/', 'video/'] : ['video/', 'image/'])

const isWindowMode = computed(() => props.mode === 'window')
const isEdit = computed(() => !!props.track)

// ── 구성 상태 ──
const lane = ref(null) // 윈도우 모드 레인
const clipByWin = ref({}) // 창 id → 클립
const audios = ref([])

const srcClips = (track) => (Array.isArray(track?.clips) ? track.clips : track?.uuid ? [track] : [])

// 영상 슬롯 = 씬: 전 창 / 윈도우: 레인 창 하나
const slots = computed(() =>
  isWindowMode.value ? windows.value.filter((w) => w.id === lane.value) : windows.value,
)

onMounted(() => {
  const tr = props.track
  if (isWindowMode.value) {
    const c = srcClips(tr)[0]
    lane.value =
      props.windowId ??
      (c && Number.isInteger(c.window) ? c.window : Number.isInteger(tr?.window) ? tr.window : null) ??
      windows.value[0]?.id ??
      0
    if (c?.uuid) clipByWin.value = { [lane.value]: { ...c } }
  } else {
    const map = {}
    for (const c of srcClips(tr))
      if (c?.uuid) map[Number.isInteger(c.window) ? c.window : 0] = { ...c }
    clipByWin.value = map
  }
  audios.value = (tr?.audios || []).filter((a) => a && a.uuid).map((a) => ({ ...a }))

  if (props.autoPick === 'audio') pickAudio()
  else if (props.autoPick === 'video') {
    const W = props.focusWindow ?? slots.value.find((w) => !clipByWin.value[w.id])?.id
    if (W != null) pickVideo(W)
  }
})

const laneOptions = computed(() => windows.value.map((w) => ({ label: w.name, value: w.id })))
const changeLane = (W) => {
  // 레인을 바꾸면 영상도 그 창으로 옮긴다 (항목은 영상 0~1개)
  const c = clipByWin.value[lane.value]
  lane.value = W
  clipByWin.value = c ? { [W]: { ...c, window: W } } : {}
}

const fileFields = (f) => ({
  uuid: f.uuid,
  filename: f.filename,
  mimetype: f.mimetype,
  metadata: f.metadata,
})

// 창 W의 영상 선택/교체 — 파일 선택 팝업(단일)
const pickVideo = (W) => {
  $q.dialog({
    component: addTracks,
    componentProps: { playlist: props.playlist, single: true, mimeFilter: clipMimeFilter(W) },
  }).onOk((sel) => {
    if (!sel || !sel.length) return
    const cur = clipByWin.value[W]
    // 교체 시 그 창 클립의 지연/볼륨/라우팅 설정은 유지
    clipByWin.value = { ...clipByWin.value, [W]: { ...(cur || {}), ...fileFields(sel[0]), window: W } }
  })
}
const clearVideo = (W) => {
  const m = { ...clipByWin.value }
  delete m[W]
  clipByWin.value = m
}

// 오디오 추가 — 파일 선택 팝업(여러 개)
const pickAudio = () => {
  $q.dialog({
    component: addTracks,
    componentProps: { playlist: props.playlist, mimeFilter: 'audio/' },
  }).onOk((sel) => {
    if (!sel || !sel.length) return
    for (const f of sel)
      audios.value.push({
        ...fileFields(f),
        volume: 100,
        muted: false,
        loop: false,
        channel_map: null,
        channels: null,
      })
  })
}
const removeAudio = (i) => audios.value.splice(i, 1)

// ── 오디오 상태 요약(텍스트) + 설정 팝업(audioChannelsDialog) ──
const outCount = computed(() => {
  const dev = (pStatus.value.audioDevices || []).find((d) => d.deviceId === pStatus.value.audioDevice)
  return dev?.channels ?? 2
})
const chLabel = (o) => t('playlists.sceneAudioList.channelN', { n: o + 1 })
// 예: "2ch → Ch 1, Ch 2 · 볼륨 80% · 지연 120ms" / "뮤트"
const audioSummary = (src, kind) => {
  if (kind === 'embedded' && !hasEmbeddedAudio(src)) return t('dialogs.trackEditor.noEmbeddedAudio')
  const chs = sourceChannels(src, kind, outCount.value)
  const live = chs.filter((c) => !c.muted && c.out >= 0)
  if (!live.length) return t('dialogs.trackEditor.statusMuted', { n: chs.length })
  const parts = [
    t('dialogs.trackEditor.statusRoute', {
      n: chs.length,
      outs: [...new Set(live.map((c) => c.out))].sort((a, b) => a - b).map(chLabel).join(', '),
    }),
  ]
  const vols = live.map((c) => c.volume)
  const lo = Math.min(...vols)
  const hi = Math.max(...vols)
  parts.push(t('dialogs.trackEditor.statusVolume', { v: lo === hi ? `${lo}` : `${lo}–${hi}` }))
  const mutedN = chs.length - live.length
  if (mutedN) parts.push(t('dialogs.trackEditor.statusPartMuted', { n: mutedN }))
  const maxDelay = Math.max(...live.map((c) => c.delay_ms || 0))
  if (maxDelay > 0) parts.push(t('dialogs.trackEditor.statusDelay', { ms: maxDelay }))
  return parts.join(' · ')
}

const editVideoAudio = (W) => {
  $q.dialog({
    component: audioChannelsDialog,
    componentProps: { source: clipByWin.value[W], kind: 'embedded' },
  }).onOk((src) => {
    clipByWin.value = { ...clipByWin.value, [W]: src }
  })
}
const editAudio = (i) => {
  $q.dialog({
    component: audioChannelsDialog,
    componentProps: {
      source: audios.value[i],
      kind: 'extra',
      audioWindow: isWindowMode.value ? lane.value : null,
    },
  }).onOk((src) => {
    audios.value.splice(i, 1, src)
  })
}

const clipCount = computed(() => Object.keys(clipByWin.value).length)
const isValid = computed(() => clipCount.value + audios.value.length > 0)

const isThumbable = (f) => f && (f.mimetype?.startsWith('image/') || f.mimetype?.startsWith('video/'))

const submit = () => {
  if (!isValid.value) return
  const order = new Map(windows.value.map((w, i) => [w.id, i]))
  const clips = Object.values(clipByWin.value).sort(
    (a, b) => (order.get(a.window) ?? 99) - (order.get(b.window) ?? 99),
  )
  onDialogOK({ clips, audios: audios.value, window: isWindowMode.value ? lane.value : null })
}
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="dialog-card">
      <q-card-section class="row items-center q-pb-sm">
        <q-icon :name="isEdit ? 'edit' : 'playlist_add'" size="sm" color="grey-7" />
        <div class="text-h6 q-ml-sm">
          {{ isEdit ? $t('dialogs.trackEditor.editTitle') : $t('dialogs.trackEditor.addTitle') }}
        </div>
        <q-space />
        <span class="text-caption text-muted ellipsis">{{ props.playlist?.name || '' }}</span>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <!-- 윈도우 모드 + 레인 미지정: 창 선택 -->
        <q-select
          v-if="isWindowMode && props.windowId == null"
          :model-value="lane"
          @update:model-value="changeLane"
          :options="laneOptions"
          emit-value
          map-options
          dense
          outlined
          options-dense
          class="q-mb-md"
          :label="$t('dialogs.trackEditor.windowLabel')"
        />

        <!-- 영상: 창별 1개 (없음 가능) -->
        <div class="section-label">{{ $t('dialogs.trackEditor.video') }}</div>
        <q-list bordered separator class="rounded-list">
          <q-item v-for="w in slots" :key="w.id" class="q-py-xs">
            <q-item-section avatar>
              <q-img
                v-if="isThumbable(clipByWin[w.id])"
                :src="`${getAddr()}/api/files/thumbnail/${clipByWin[w.id].uuid}`"
                class="thumb"
              />
              <div v-else class="thumb flex flex-center">
                <q-icon
                  :name="clipByWin[w.id] ? 'music_note' : w.audioOnly ? 'volume_up' : 'tv'"
                  size="18px"
                  color="grey-6"
                />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label caption>{{ w.name }}</q-item-label>
              <q-item-label class="ellipsis" :class="{ 'text-muted': !clipByWin[w.id] }">
                {{ clipByWin[w.id]?.filename || $t('dialogs.trackEditor.none') }}
              </q-item-label>
              <q-item-label v-if="clipByWin[w.id]" caption class="ellipsis status-text">
                {{ audioSummary(clipByWin[w.id], 'embedded') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row no-wrap items-center">
                <q-btn
                  v-if="clipByWin[w.id] && hasEmbeddedAudio(clipByWin[w.id])"
                  flat
                  dense
                  round
                  icon="tune"
                  color="grey-7"
                  @click="editVideoAudio(w.id)"
                >
                  <q-tooltip>{{ $t('dialogs.trackEditor.audioSettings') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  no-caps
                  color="grey-8"
                  :icon="clipByWin[w.id] ? 'swap_horiz' : 'add'"
                  :label="
                    clipByWin[w.id]
                      ? $t('dialogs.trackEditor.replaceVideo')
                      : $t('dialogs.trackEditor.selectVideo')
                  "
                  @click="pickVideo(w.id)"
                />
                <q-btn
                  v-if="clipByWin[w.id]"
                  flat
                  dense
                  round
                  icon="close"
                  color="grey-7"
                  @click="clearVideo(w.id)"
                >
                  <q-tooltip>{{ $t('dialogs.trackEditor.noneHint') }}</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- 오디오: 여러 개 -->
        <div class="section-label q-mt-md">{{ $t('dialogs.trackEditor.audio') }}</div>
        <q-list bordered separator class="rounded-list">
          <q-item v-for="(a, i) in audios" :key="a.uuid + '-' + i" class="q-py-xs">
            <q-item-section avatar>
              <div class="thumb flex flex-center">
                <q-icon name="music_note" size="18px" color="grey-6" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="ellipsis">{{ a.filename || a.uuid }}</q-item-label>
              <q-item-label caption class="ellipsis status-text">{{ audioSummary(a, 'extra') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row no-wrap items-center">
                <q-btn flat dense round icon="tune" color="grey-7" @click="editAudio(i)">
                  <q-tooltip>{{ $t('dialogs.trackEditor.audioSettings') }}</q-tooltip>
                </q-btn>
                <q-btn flat dense round icon="close" color="grey-7" @click="removeAudio(i)" />
              </div>
            </q-item-section>
          </q-item>
          <q-item v-if="!audios.length" class="q-py-xs">
            <q-item-section class="text-muted text-caption">{{
              $t('dialogs.trackEditor.noAudio')
            }}</q-item-section>
          </q-item>
        </q-list>
        <q-btn
          flat
          dense
          no-caps
          icon="add"
          color="grey-8"
          class="q-mt-xs"
          :label="$t('dialogs.trackEditor.addAudio')"
          @click="pickAudio"
        />      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <span v-if="!isValid" class="text-caption text-muted q-mr-sm">{{
          $t('dialogs.trackEditor.needOne')
        }}</span>
        <q-btn flat no-caps :label="$t('common.cancel')" color="grey-7" @click="onDialogCancel" />
        <q-btn
          unelevated
          no-caps
          color="primary"
          :label="isEdit ? $t('dialogs.trackEditor.save') : $t('common.add')"
          :disable="!isValid"
          @click="submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: var(--radius-lg);
  background-color: var(--surface-1);
  min-width: 360px;
  max-width: 600px;
  width: 50%;
}
.status-text {
  color: var(--text-2);
}
.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted, #999);
  margin: 0 2px 4px;
}
.rounded-list {
  border-radius: var(--radius-md);
  background: var(--surface-0);
  max-height: 260px;
  overflow-y: auto;
}
.thumb {
  width: 56px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--surface-3);
}
</style>
