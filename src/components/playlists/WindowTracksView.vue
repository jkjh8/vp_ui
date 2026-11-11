<script setup>
// 윈도우(Window) 기반 트랙 리스트. 창마다 독립 재생 목록을 가지며 창별로 재생/정지한다.
// 장면 모드(TracksView)와 동일하게 세로로 쌓인 접이식 창 카드 리스트로 표시한다.
// 데이터: 플레이리스트 tracks[] = 단일 창 항목의 평면 배열(하이드레이션 후엔 1클립 장면
// {clips:[clip], audios}). 창 id로 그룹핑해 창별 카드로 표시.
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { useApiStore } from 'src/stores/useApi'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import Draggable from 'vuedraggable'
import SceneAudioList from './SceneAudioList.vue'
import trackEditor from '../dialogs/trackEditor.vue'
import { toPersistedWindowTracks } from 'src/composables/useTracks'
import { useI18n } from 'vue-i18n'
import { usePlayback } from 'src/composables/usePlayback'

const { t } = useI18n()
// 창 오디오 전체 뮤트 (파사드 경유) — 레인 헤더에서 재생/정지와 함께 운영
const { isWindowMuted, toggleWindowMute } = usePlayback()
const $q = useQuasar()
const playlistStore = usePlaylistStore()
const { playlists, currentPlaylist } = storeToRefs(playlistStore)
const { getAddr } = useApiStore()
const { pStatus } = storeToRefs(useStatusStore())

const currentPlaylistObj = computed(() =>
  playlists.value?.find((p) => p._id === currentPlaylist.value),
)
const hasPlaylist = computed(
  () => currentPlaylist.value && playlists.value?.some((p) => p._id === currentPlaylist.value),
)
const windowList = computed(() =>
  (pStatus.value.windows || []).map((w) => ({ id: w.id, name: w.name })),
)
const tracks = computed(() => currentPlaylistObj.value?.tracks || [])

// 오디오 전용 창(화면 송출 없음)은 음원(또는 영상의 오디오)을 클립으로 받는다. 일반 창은 영상/이미지.
const isAudioWin = (id) => (pStatus.value.windows || []).some((w) => w.id === id && w.audioOnly)

const clipOf = (t) => (Array.isArray(t?.clips) ? t.clips[0] : t) || {}
const clipWin = (t) => {
  const c = clipOf(t)
  if (Number.isInteger(c.window)) return c.window
  // 오디오 전용 항목(클립 없음)은 항목의 window 필드로 레인 결정
  return Number.isInteger(t?.window) ? t.window : 0
}
// 오디오 전용 항목 판정 (영상 클립 없음) + 표시 라벨
const isAudioOnly = (item) => !clipOf(item).uuid
const itemLabel = (item) => {
  if (!isAudioOnly(item)) return clipOf(item).filename || t('playlists.windowTracksView.loadingFallback')
  const a = (item.audios || []).find((x) => x && x.filename)
  return a ? a.filename : t('playlists.windowTracksView.audioFallback')
}

// 창별 레인 (로컬 반응형) — 서버 tracks에서 재구성. 편집은 레인을 mutate 후 persist.
const lanes = reactive({})
const rebuildLanes = () => {
  const byWin = {}
  for (const w of windowList.value) byWin[w.id] = []
  for (const t of tracks.value) {
    const W = clipWin(t)
    if (!byWin[W]) byWin[W] = [] // 설정 밖 창의 잔존 항목도 보관(정리 대상)
    byWin[W].push(t)
  }
  for (const k of Object.keys(lanes)) delete lanes[k]
  for (const w of windowList.value) lanes[w.id] = byWin[w.id] || []
}
watch([tracks, windowList], rebuildLanes, { immediate: true, deep: false })

// 레인 전체를 창 순서대로 평탄화해 저장 (창 내 순서 = 재생 순서).
const persist = () =>
  playlistStore
    .updatePlaylist(currentPlaylist.value, {
      tracks: toPersistedWindowTracks(windowList.value.flatMap((w) => lanes[w.id] || [])),
      mode: 'window',
    })
    .catch((e) => console.error('window tracks persist failed', e))

// ── 창 카드 접기/펼치기 (창 id 기준). 플레이리스트 처음 열면 전부 접힘. ──
const collapsed = ref(new Set())
const initedFor = ref(null)
watch(
  [currentPlaylist, windowList],
  () => {
    if (initedFor.value !== currentPlaylist.value && windowList.value.length) {
      collapsed.value = new Set(windowList.value.map((w) => w.id)) // 기본 접힘
      initedFor.value = currentPlaylist.value
    }
  },
  { immediate: true },
)
const isCollapsed = (id) => collapsed.value.has(id)
const toggleCollapse = (id) => {
  const s = new Set(collapsed.value)
  s.has(id) ? s.delete(id) : s.add(id)
  collapsed.value = s
}

// ── 재생 상태 ──
const winState = (W) => pStatus.value.windowStates?.[W] || null
const isWinPlaying = (W) =>
  currentPlaylistObj.value?.playlistId === pStatus.value.playlist?.playlistId && !!winState(W)
const playingSeq = (W) => {
  const st = winState(W)
  return Number.isInteger(st?.seqIndex)
    ? st.seqIndex
    : Number.isInteger(st?.trackId)
      ? st.trackId
      : -1
}
// 이 창의 현재 재생 중인 항목(트랙)인지 — 창이 아니라 "재생 트랙"을 강조하는 근거.
const isItemPlaying = (W, index) => isWinPlaying(W) && playingSeq(W) === index

// ── 창별 재생/정지 ──
const playWin = (W, index = 0) =>
  playlistStore.playWindow(playlistStore.getCurrentPlaylistId(), W, index)
const stopWin = (W) => playlistStore.stopWindow(W)

// ── 항목 편집 ──
const isThumbable = (clip) =>
  clip && (clip.mimetype?.startsWith('image/') || clip.mimetype?.startsWith('video/'))

// 항목 추가/편집 — 영상(0~1개)과 오디오를 한 팝업(trackEditor)에서. 하나만 있어도 저장된다.
// 영상 없는 항목은 재생 시 이 창은 배경 표시 + 오디오만, 오디오 길이 후 다음 항목.
const editorResultToItem = (W, { clips, audios }) =>
  clips.length
    ? { clips: [{ ...clips[0], window: W }], audios }
    : { clips: [], window: W, audios }
const addItem = (W) => {
  $q.dialog({
    component: trackEditor,
    componentProps: { playlist: currentPlaylistObj.value, mode: 'window', windowId: W },
  }).onOk((res) => {
    lanes[W].push(editorResultToItem(W, res))
    persist()
  })
}
const editItem = (W, item, opts = {}) => {
  $q.dialog({
    component: trackEditor,
    componentProps: {
      playlist: currentPlaylistObj.value,
      mode: 'window',
      windowId: W,
      track: item,
      ...opts,
    },
  }).onOk((res) => {
    const next = editorResultToItem(W, res)
    item.clips = next.clips
    item.audios = next.audios
    if ('window' in next) item.window = W
    persist()
  })
}
const removeItem = (W, idx) => {
  lanes[W].splice(idx, 1)
  persist()
}
// 항목 단위 오디오 편집 (SceneAudioList 재사용 — 각 항목 = 1클립 장면)
const patchClip = (item, _win, patch) => {
  Object.assign(clipOf(item), patch)
  persist()
}
const patchAudios = (item, audios) => {
  item.audios = audios
  persist()
}
const addAudio = (W, item) => editItem(W, item, { autoPick: 'audio' })

// 오디오 채널 수 배지
const itemAudioChannels = (item) => {
  const cnt = (file) => {
    const a = (file?.metadata?.streams || []).find((s) => s.codec_type === 'audio')
    return a?.channels > 0 ? a.channels : 0
  }
  let n = cnt(clipOf(item))
  for (const a of item.audios || []) n += cnt(a) || 2
  return n
}

// 항목 오디오 패널 펼침 (세션 로컬, key = window-idx)
const expanded = ref(new Set())
const keyOf = (W, i) => `${W}-${i}`
const isExpanded = (W, i) => expanded.value.has(keyOf(W, i))
const toggleExpand = (W, i) => {
  const s = new Set(expanded.value)
  const k = keyOf(W, i)
  s.has(k) ? s.delete(k) : s.add(k)
  expanded.value = s
}
</script>

<template>
  <div>
    <div v-if="!hasPlaylist" class="text-center text-muted q-pa-lg">
      {{ $t('playlists.windowTracksView.selectPlaylist') }}
    </div>
    <div v-else-if="windowList.length === 0" class="text-center text-muted q-pa-lg">
      {{ $t('playlists.windowTracksView.noOutputWindows') }}
    </div>

    <template v-else>
      <q-card
        v-for="w in windowList"
        :key="w.id"
        flat
        bordered
        class="lane-card q-mb-sm"
        :class="{ 'lane-card--active': isWinPlaying(w.id) }"
      >
        <!-- 레인 헤더: 접기 + 창 이름 + 창별 재생/정지 -->
        <div class="lane-head row items-center">
          <q-btn
            dense
            flat
            round
            size="sm"
            :icon="isCollapsed(w.id) ? 'chevron_right' : 'expand_more'"
            color="grey-7"
            @click="toggleCollapse(w.id)"
          >
            <q-tooltip>{{
              isCollapsed(w.id)
                ? $t('playlists.windowTracksView.expand')
                : $t('playlists.windowTracksView.collapse')
            }}</q-tooltip>
          </q-btn>
          <q-icon :name="isAudioWin(w.id) ? 'volume_up' : 'tv'" size="18px" color="grey-7" class="q-mr-xs" />
          <div
            class="lane-name text-weight-medium ellipsis cursor-pointer"
            @click="toggleCollapse(w.id)"
          >
            {{ w.name }}
          </div>
          <span class="text-caption text-muted q-ml-sm">({{ (lanes[w.id] || []).length }})</span>
          <q-space />
          <q-btn
            dense
            flat
            round
            :icon="isWindowMuted(w.id) ? 'volume_off' : 'volume_up'"
            :color="isWindowMuted(w.id) ? 'negative' : 'grey-7'"
            @click="toggleWindowMute(w.id)"
          >
            <q-tooltip>{{
              isWindowMuted(w.id)
                ? $t('controls.controlBtns.unmuteWindow')
                : $t('controls.controlBtns.muteWindow')
            }}</q-tooltip>
          </q-btn>
          <q-btn
            dense
            flat
            round
            icon="play_arrow"
            color="grey-7"
            @click="playWin(w.id, 0)"
            :disable="!(lanes[w.id] || []).length"
          >
            <q-tooltip>{{ $t('playlists.windowTracksView.playThisWindow') }}</q-tooltip>
          </q-btn>
          <q-btn
            dense
            flat
            round
            icon="stop"
            color="red-10"
            @click="stopWin(w.id)"
            :disable="!isWinPlaying(w.id)"
          >
            <q-tooltip>{{ $t('playlists.windowTracksView.stopThisWindow') }}</q-tooltip>
          </q-btn>
        </div>

        <!-- 현재 재생 항목 (접혀 있어도 표시) -->
        <div v-if="isWinPlaying(w.id)" class="lane-now text-caption ellipsis">
          <q-icon name="graphic_eq" size="12px" class="q-mr-xs" />{{
            winState(w.id)?.filename || ''
          }}
        </div>

        <div v-show="!isCollapsed(w.id)">
          <!-- 레인 항목 목록 (드래그 정렬) -->
          <Draggable
            v-model="lanes[w.id]"
            @end="persist"
            item-key="uuid"
            handle=".drag-handle"
            animation="200"
            class="lane-body"
          >
            <template #item="{ element: item, index }">
              <div class="item-wrap" :class="{ 'item-wrap--playing': isItemPlaying(w.id, index) }">
                <div class="item-row">
                  <div class="drag-handle" style="cursor: grab">
                    <q-icon name="drag_indicator" color="grey-6" size="18px" />
                  </div>
                  <q-img
                    v-if="isThumbable(clipOf(item))"
                    :src="`${getAddr()}/api/files/thumbnail/${clipOf(item).uuid}`"
                    class="item-thumb"
                    @click="editItem(w.id, item)"
                  />
                  <div v-else class="item-thumb flex flex-center" @click="editItem(w.id, item)">
                    <q-icon
                      :name="isAudioOnly(item) ? 'music_note' : 'movie'"
                      size="18px"
                      :color="isAudioOnly(item) ? 'teal' : 'grey-6'"
                    />
                  </div>
                  <div class="item-main">
                    <div class="item-name ellipsis">
                      <q-icon
                        v-if="isItemPlaying(w.id, index)"
                        name="play_arrow"
                        color="grey-7"
                        size="16px"
                        class="q-mr-xs"
                      />
                      {{ itemLabel(item) }}
                    </div>
                  </div>
                  <q-btn
                    dense
                    flat
                    round
                    size="sm"
                    icon="play_arrow"
                    color="grey-7"
                    @click="playWin(w.id, index)"
                  >
                    <q-tooltip>{{ $t('playlists.windowTracksView.playFromItem') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    dense
                    flat
                    round
                    size="sm"
                    :icon="isExpanded(w.id, index) ? 'expand_less' : 'graphic_eq'"
                    color="grey-7"
                    @click="toggleExpand(w.id, index)"
                  >
                    <q-tooltip>{{
                      $t('playlists.windowTracksView.audio') +
                      (itemAudioChannels(item)
                        ? ' · ' + $t('playlists.windowTracksView.chCount', { n: itemAudioChannels(item) })
                        : '')
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn dense flat round size="sm" icon="edit" color="grey-7" @click="editItem(w.id, item)">
                    <q-tooltip>{{ $t('playlists.windowTracksView.edit') }}</q-tooltip>
                  </q-btn>
                  <q-btn dense flat round size="sm" icon="delete" color="grey-7" @click="removeItem(w.id, index)">
                    <q-tooltip>{{ $t('common.remove') }}</q-tooltip>
                  </q-btn>
                </div>

                <!-- 항목 오디오 (내장 + 추가) -->
                <div v-show="isExpanded(w.id, index)" class="item-audio">
                  <div class="row items-center q-px-sm">
                    <q-icon name="graphic_eq" size="14px" color="grey-7" />
                    <span class="text-caption text-weight-medium q-ml-xs">{{ $t('playlists.windowTracksView.audio') }}</span>
                  </div>
                  <SceneAudioList
                    :scene="item"
                    :scene-idx="index"
                    :on-patch-clip="(win, p) => patchClip(item, win, p)"
                    :on-patch-audios="(audios) => patchAudios(item, audios)"
                    :audio-window="w.id"
                  />
                  <!-- 영상 추가처럼 왼쪽 하단 버튼으로 배치 -->
                  <q-btn
                    flat
                    dense
                    icon="add"
                    :label="$t('playlists.windowTracksView.addAudio')"
                    color="grey-7"
                    class="add-audio-btn"
                    @click="addAudio(w.id, item)"
                  />
                </div>
              </div>
            </template>
          </Draggable>

          <div class="row items-center">
            <!-- 항목 추가: 영상·오디오를 한 팝업에서 (둘 중 하나만 있어도 됨) -->
            <q-btn
              flat
              dense
              no-caps
              icon="add"
              :label="$t('common.add')"
              color="grey-7"
              class="add-item-btn"
              @click="addItem(w.id)"
            />
          </div>
        </div>
      </q-card>
    </template>
  </div>
</template>

<style scoped>
.lane-card {
  background: var(--surface-1);
  border-radius: var(--radius-md);
}
/* 재생 중인 창(레인)은 은은한 좌측 바로만 표시 — 강한 강조는 "재생 트랙"(item)이 가진다. */
.lane-card--active {
  border-left: 3px solid var(--accent);
}
.lane-head {
  padding: 6px 10px;
  gap: 4px;
  border-bottom: 1px solid var(--border);
}
.lane-name {
  color: var(--text-1);
}
.lane-now {
  padding: 3px 10px;
  color: var(--accent);
  border-bottom: 1px dashed var(--border);
}
.lane-body {
  padding: 4px 8px;
  min-height: 8px;
}
.item-wrap {
  border-bottom: 1px solid var(--border);
}
/* 재생 중인 트랙(항목) — 강한 강조: 좌측 액센트 바 + 배경 틴트 + 이름 강조 */
.item-wrap--playing {
  background: var(--accent-weak, rgba(59, 130, 246, 0.16));
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-sm);
}
.item-wrap--playing .item-name {
  color: var(--accent);
  font-weight: 600;
}
.item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 2px;
}
.item-thumb {
  width: 64px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--surface-3);
  cursor: pointer;
  flex: 0 0 auto;
}
.item-main {
  flex: 1;
  min-width: 0;
}
.item-name {
  font-size: 13px;
  color: var(--text-1);
}
.item-audio {
  border-top: 1px dashed var(--border);
  background: var(--surface-0);
  padding-bottom: 4px;
}
.add-item-btn {
  margin: 4px 8px 8px;
}
.add-audio-btn {
  margin: 2px 8px 6px;
}
</style>
