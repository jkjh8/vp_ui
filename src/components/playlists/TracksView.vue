<script setup>
// 장면(Scene) 기반 트랙 리스트. 트랙 1개 = 장면 = 창별 동영상 묶음(clips[]).
// 영상 클립을 오디오처럼 세로 리스트로 표시. 영상은 창당 1개(창 수를 넘지 못함), 각 클립은
// 서로 다른 창에 배정. 창을 줄이면 그 창의 클립은 서버가 정리한다.
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { useApiStore } from 'src/stores/useApi'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import Draggable from 'vuedraggable'
import SceneAudioList from './SceneAudioList.vue'
import DelayChip from './DelayChip.vue'
import trackEditor from '../dialogs/trackEditor.vue'
import { toPersistedTrack, toPersistedClip, toPersistedAudio } from 'src/composables/useTracks'
import { useI18n } from 'vue-i18n'
import { usePlayback } from 'src/composables/usePlayback'

const { t } = useI18n()
const $q = useQuasar()
const playlistStore = usePlaylistStore()
const { playlists, currentPlaylist } = storeToRefs(playlistStore)
const { getAddr } = useApiStore()
const { pStatus } = storeToRefs(useStatusStore())

// 장면 카드 접기/펼치기 (세션 로컬, 인덱스 기준). 플레이리스트 처음 열면 전부 접힘.
const collapsed = ref(new Set())
const isCollapsed = (i) => collapsed.value.has(i)
const toggleCollapse = (i) => {
  const s = new Set(collapsed.value)
  s.has(i) ? s.delete(i) : s.add(i)
  collapsed.value = s
}
const currentPlaylistObj = computed(() =>
  playlists.value?.find((p) => p._id === currentPlaylist.value),
)
const scenes = computed({
  get: () => currentPlaylistObj.value?.tracks || [],
  set: (v) => {
    if (currentPlaylistObj.value) currentPlaylistObj.value.tracks = v
  },
})
const hasPlaylist = computed(
  () => currentPlaylist.value && playlists.value?.some((p) => p._id === currentPlaylist.value),
)

// 플레이리스트를 처음 열면 전 장면을 접힘으로 초기화 (플레이리스트별 1회, 이후 사용자 토글 유지).
const initedFor = ref(null)
watch(
  [currentPlaylist, scenes],
  () => {
    if (initedFor.value !== currentPlaylist.value && scenes.value.length) {
      collapsed.value = new Set(scenes.value.map((_, i) => i))
      initedFor.value = currentPlaylist.value
    }
  },
  { immediate: true },
)

// 창 오디오 전체 뮤트 (파사드 경유) — 씬형은 창이 장면마다 흩어져 있으므로 헤더에 창별로 모아 둔다
const { isWindowMuted, toggleWindowMute } = usePlayback()

// 장면 오디오 영역 펼침 상태 (세션 로컬, 인덱스 기준) — 기본은 접힘
const audioOpen = ref(new Set())
const isAudioOpen = (i) => audioOpen.value.has(i)
const toggleAudio = (i) => {
  const st = new Set(audioOpen.value)
  st.has(i) ? st.delete(i) : st.add(i)
  audioOpen.value = st
}

// 설정된 출력 창 목록 (사용자가 추가한 창만)
const windowList = computed(() =>
  (pStatus.value.windows || []).map((w) => ({ id: w.id, name: w.name })),
)
const mutedCount = computed(() => windowList.value.filter((w) => isWindowMuted(w.id)).length)
const clipWin = (c) => (Number.isInteger(c.window) ? c.window : 0)

const isThumbable = (clip) =>
  clip && (clip.mimetype?.startsWith('image/') || clip.mimetype?.startsWith('video/'))

// 재생 중인 장면 하이라이트 — windowStates(창별 실상태, 소켓으로 통째 교체 = 항상 최신)를 근거로
// 사용한다. (pStatus.trackId 스칼라는 deepAssign 병합이라 갱신이 어긋나 하이라이트가 누락될 수 있다.
// windowStates는 WindowTracksView도 쓰는 신뢰 신호.)
const isSamePlaylist = computed(
  () =>
    !!currentPlaylistObj.value &&
    currentPlaylistObj.value.playlistId === pStatus.value.playlist?.playlistId,
)
const playingSceneIndices = computed(() => {
  const set = new Set()
  for (const st of Object.values(pStatus.value.windowStates || {})) {
    const idx = Number.isInteger(st?.sceneIndex)
      ? st.sceneIndex
      : Number.isInteger(st?.trackId)
        ? st.trackId
        : null
    if (idx != null) set.add(idx)
  }
  return set
})
const isScenePlaying = (index) => isSamePlaylist.value && playingSceneIndices.value.has(index)

// 장면의 클립들 (설정된 창 순서로 정렬해 보여줌)
const sceneClips = (scene) => {
  const order = new Map(windowList.value.map((w, i) => [w.id, i]))
  return [...(scene.clips || [])].sort(
    (a, b) => (order.get(clipWin(a)) ?? 99) - (order.get(clipWin(b)) ?? 99),
  )
}
// 이 장면에서 다른 클립이 이미 쓰는 창(자기 자신 제외)
const usedWindows = (scene, exceptWin) =>
  new Set((scene.clips || []).map(clipWin).filter((w) => w !== exceptWin))
// 클립 창 선택 옵션 = 미사용 창 + 자기 창
const windowOptions = (scene, clip) => {
  const used = usedWindows(scene, clipWin(clip))
  return windowList.value
    .filter((w) => !used.has(w.id) || w.id === clipWin(clip))
    .map((w) => ({ label: w.name, value: w.id }))
}
const canAddVideo = (scene) =>
  windowList.value.length > 0 && (scene.clips || []).length < windowList.value.length
const firstUnusedWindow = (scene) => {
  const used = new Set((scene.clips || []).map(clipWin))
  const w = windowList.value.find((x) => !used.has(x.id))
  return w ? w.id : null
}

// ── 저장 ──
const persistScene = (sceneIdx, clips) =>
  playlistStore.updateTrack(currentPlaylist.value, sceneIdx, { clips: clips.map(toPersistedClip) })
const updateSceneOrder = () =>
  playlistStore
    .updatePlaylist(currentPlaylist.value, { tracks: scenes.value.map(toPersistedTrack) })
    .catch((e) => console.error('scene reorder failed', e))

// 장면 편집 — 영상(창별)과 오디오를 한 팝업(trackEditor)에서 함께. 하나만 있어도 저장된다.
const openSceneEditor = (sceneIdx, opts = {}) => {
  $q.dialog({
    component: trackEditor,
    componentProps: {
      playlist: currentPlaylistObj.value,
      mode: 'scene',
      track: scenes.value[sceneIdx],
      ...opts,
    },
  }).onOk(({ clips, audios }) =>
    playlistStore.updateTrack(currentPlaylist.value, sceneIdx, {
      clips: clips.map(toPersistedClip),
      audios: audios.map(toPersistedAudio),
    }),
  )
}
const editScene = (sceneIdx) => openSceneEditor(sceneIdx)
// 영상 추가/교체 = 해당 창 슬롯을 선택한 채로 편집 팝업
const addVideo = (sceneIdx) => {
  const win = firstUnusedWindow(scenes.value[sceneIdx])
  if (win == null) return
  openSceneEditor(sceneIdx, { autoPick: 'video', focusWindow: win })
}
const replaceVideo = (sceneIdx, clip) =>
  openSceneEditor(sceneIdx, { autoPick: 'video', focusWindow: clipWin(clip) })
const setClipWindow = (sceneIdx, clip, newWin) => {
  newWin = Number(newWin)
  const scene = scenes.value[sceneIdx]
  if (usedWindows(scene, clipWin(clip)).has(newWin)) return // 이미 사용 중인 창
  const clips = (scene.clips || []).map((c) =>
    clipWin(c) === clipWin(clip) ? { ...c, window: newWin } : c,
  )
  persistScene(sceneIdx, clips)
}
const setClipDelay = (sceneIdx, clip, ms) => {
  const clips = (scenes.value[sceneIdx].clips || []).map((c) =>
    clipWin(c) === clipWin(clip) ? { ...c, delay_ms: Math.max(0, Number(ms) || 0) } : c,
  )
  persistScene(sceneIdx, clips)
}
const removeVideo = (sceneIdx, clip) =>
  persistScene(
    sceneIdx,
    (scenes.value[sceneIdx].clips || []).filter((c) => clipWin(c) !== clipWin(clip)),
  )
const patchClip = (sceneIdx, win, p) => {
  const clips = (scenes.value[sceneIdx].clips || []).map((c) =>
    clipWin(c) === win ? { ...c, ...p } : c,
  )
  persistScene(sceneIdx, clips)
}
// 장면 단위 추가 오디오 리스트 저장 (SceneAudioList의 onPatchAudios — audios 배열)
const persistSceneAudios = (sceneIdx, audios) =>
  playlistStore.updateTrack(currentPlaylist.value, sceneIdx, {
    audios: (audios || []).map(toPersistedAudio),
  })
// 오디오 채널 수(임베디드+추가) — 배지 표시용
const sceneAudioChannels = (scene) => {
  const cnt = (file) => {
    const a = (file?.metadata?.streams || []).find((s) => s.codec_type === 'audio')
    return a?.channels > 0 ? a.channels : 0
  }
  let n = 0
  for (const c of scene.clips || []) n += cnt(c)
  for (const a of scene.audios || []) n += cnt(a) || 2
  return n
}

// 장면에 추가 오디오 파일 넣기 (오디오 영역 하단 버튼) — 편집 팝업 + 오디오 파일 선택 바로 열기
const addAudio = (sceneIdx) => openSceneEditor(sceneIdx, { autoPick: 'audio' })

// 장면 추가 — 편집 팝업에서 영상/오디오를 고른 뒤 만든다 (둘 중 하나만 있어도 됨).
const addScene = () => {
  $q.dialog({
    component: trackEditor,
    componentProps: { playlist: currentPlaylistObj.value, mode: 'scene' },
  }).onOk(({ clips, audios }) =>
    playlistStore.updatePlaylist(currentPlaylist.value, {
      tracks: [...scenes.value.map(toPersistedTrack), toPersistedTrack({ clips, audios })],
    }),
  )
}
const removeScene = (sceneIdx) =>
  playlistStore.updatePlaylist(currentPlaylist.value, {
    tracks: scenes.value.filter((_, i) => i !== sceneIdx).map(toPersistedTrack),
  })
// 장면 이름 지정(선택) — 비우면 기본 "장면 N" 표시로 복귀. 이름만 바꾸는 부분 갱신이라 재생 무영향.
const sceneName = (scene) => (typeof scene?.name === 'string' ? scene.name.trim() : '')
const sceneLabel = (scene, index) =>
  sceneName(scene) || t('playlists.tracksView.sceneN', { n: index + 1 })
const setSceneName = (sceneIdx, name) =>
  playlistStore.updateTrack(currentPlaylist.value, sceneIdx, {
    name: (name || '').trim().slice(0, 40),
  })
const playScene = (index) => playlistStore.playlistPlay(playlistStore.getCurrentPlaylistId(), index)
</script>

<template>
  <div>
    <div class="row items-center q-mb-sm">
      <q-space />
      <!-- 창별 오디오 전체 뮤트 — 버튼 하나 + 팝업 (뮤트된 창 수 배지) -->
      <q-btn
        v-if="windowList.length"
        dense
        flat
        round
        class="q-mr-xs"
        :icon="mutedCount ? 'volume_off' : 'volume_up'"
        :color="mutedCount ? 'negative' : 'grey-7'"
      >
        <q-badge v-if="mutedCount" color="negative" floating rounded :label="mutedCount" />
        <q-tooltip>{{ $t('playlists.tracksView.windowMute') }}</q-tooltip>
        <q-menu>
          <q-list dense style="min-width: 200px">
            <q-item v-for="w in windowList" :key="w.id" clickable @click="toggleWindowMute(w.id)">
              <q-item-section avatar>
                <q-icon
                  :name="isWindowMuted(w.id) ? 'volume_off' : 'volume_up'"
                  :color="isWindowMuted(w.id) ? 'negative' : 'grey-7'"
                />
              </q-item-section>
              <q-item-section>{{ w.name }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn
        class="q-mr-xs"
        dense
        flat
        no-caps
        color="primary"
        icon="add"
        :label="$t('playlists.tracksView.addScene')"
        @click="addScene"
        :disable="windowList.length === 0"
      />
    </div>

    <div v-if="!hasPlaylist" class="text-center text-muted q-pa-lg">
      {{ $t('playlists.tracksView.selectPlaylist') }}
    </div>
    <div v-else-if="windowList.length === 0" class="text-center text-muted q-pa-lg">
      {{ $t('playlists.tracksView.noOutputWindows') }}
    </div>
    <div v-else-if="scenes.length === 0" class="text-center text-muted q-pa-lg">
      {{ $t('playlists.tracksView.noScenes') }}
    </div>

    <Draggable
      v-else
      v-model="scenes"
      @end="updateSceneOrder"
      item-key="id"
      handle=".drag-handle"
      animation="200"
    >
      <template #item="{ element: scene, index }">
        <q-card
          flat
          bordered
          class="scene-card q-mb-sm"
          :class="{ 'scene-card--active': isScenePlaying(index) }"
        >
          <!-- 헤더: 빈 영역 클릭 = 접기/펼치기, 이름 클릭 = 이름 편집 -->
          <div class="scene-head row items-center cursor-pointer" @click="toggleCollapse(index)">
            <div class="drag-handle" style="cursor: grab" @click.stop>
              <q-icon name="drag_indicator" color="grey-6" />
            </div>
            <span class="scene-idx">{{ index + 1 }}</span>

            <div class="scene-no row items-baseline no-wrap" @click.stop>
              <span
                class="text-weight-medium ellipsis cursor-pointer"
                :class="{ 'text-muted': !sceneName(scene) }"
                >{{ sceneLabel(scene, index) }}</span
              >
              <q-popup-edit
                :model-value="scene.name || ''"
                @save="(val) => setSceneName(index, val)"
                anchor="bottom left"
                v-slot="scope"
              >
                <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  counter
                  maxlength="40"
                  :label="$t('playlists.tracksView.sceneName')"
                  :placeholder="$t('playlists.tracksView.sceneN', { n: index + 1 })"
                  @keyup.enter="scope.set"
                >
                  <template #append>
                    <q-icon
                      v-if="scope.value"
                      name="close"
                      class="cursor-pointer"
                      @click="scope.value = ''"
                    />
                    <q-btn flat dense round icon="check" color="grey-7" @click="scope.set" />
                  </template>
                </q-input>
              </q-popup-edit>
              <q-tooltip>{{ $t('playlists.tracksView.setSceneNameTooltip') }}</q-tooltip>
            </div>

            <!-- 요약: 영상 N · 오디오 Mch (상세는 호버) -->
            <span class="scene-summary text-caption text-muted q-ml-sm">
              <q-icon name="movie" size="14px" />{{ (scene.clips || []).length }}
              <template v-if="sceneAudioChannels(scene)">
                · <q-icon name="graphic_eq" size="14px" />{{ sceneAudioChannels(scene) }}
              </template>
              <q-tooltip>
                {{ $t('playlists.tracksView.videoCount', { n: (scene.clips || []).length }) }}
                <template v-if="sceneAudioChannels(scene)">
                  · {{ $t('playlists.tracksView.audioCount', { n: sceneAudioChannels(scene) }) }}
                </template>
              </q-tooltip>
            </span>
            <q-space />
            <q-btn dense flat round icon="play_arrow" color="grey-7" @click.stop="playScene(index)"
              ><q-tooltip>{{ $t('playlists.tracksView.playFromScene') }}</q-tooltip></q-btn
            >
            <q-btn dense flat round icon="edit" color="grey-7" @click.stop="editScene(index)"
              ><q-tooltip>{{ $t('playlists.tracksView.editScene') }}</q-tooltip></q-btn
            >
            <q-btn dense flat round icon="delete" color="grey-7" @click.stop="removeScene(index)"
              ><q-tooltip>{{ $t('playlists.tracksView.deleteScene') }}</q-tooltip></q-btn
            >
            <q-btn
              dense
              flat
              round
              size="sm"
              :icon="isCollapsed(index) ? 'expand_less' : 'expand_more'"
              color="grey-7"
              @click.stop="toggleCollapse(index)"
            >
              <q-tooltip>{{
                isCollapsed(index)
                  ? $t('playlists.tracksView.expand')
                  : $t('playlists.tracksView.collapse')
              }}</q-tooltip>
            </q-btn>
          </div>

          <div v-show="!isCollapsed(index)">
            <!-- 영상 영역: 클립 세로 리스트 (창당 1개) -->
            <div class="clip-list">
              <div class="section-label">
                <q-icon name="movie" size="14px" color="blue-grey-6" /> {{ $t('playlists.tracksView.video') }}
              </div>
              <div v-for="clip in sceneClips(scene)" :key="clip.window" class="clip-item">
                <div class="clip-row">
                  <q-img
                    v-if="isThumbable(clip)"
                    :src="`${getAddr()}/api/files/thumbnail/${clip.uuid}`"
                    class="clip-thumb"
                    @click="replaceVideo(index, clip)"
                  />
                  <div
                    v-else
                    class="clip-thumb flex flex-center"
                    @click="replaceVideo(index, clip)"
                  >
                    <q-icon name="movie" size="20px" color="grey-6" />
                  </div>
                  <div class="clip-main">
                    <div class="clip-name ellipsis">{{ clip.filename }}</div>
                    <div class="row items-center q-gutter-x-sm q-mt-xs">
                      <select
                        class="mini-select"
                        :value="clip.window"
                        @change="setClipWindow(index, clip, $event.target.value)"
                      >
                        <option
                          v-for="o in windowOptions(scene, clip)"
                          :key="o.value"
                          :value="o.value"
                        >
                          {{ o.label }}
                        </option>
                      </select>
                      <DelayChip
                        :model-value="clip.delay_ms ?? 0"
                        @save="(ms) => setClipDelay(index, clip, ms)"
                      />
                    </div>
                  </div>
                  <q-btn dense flat round size="sm" icon="edit" color="grey-7" @click="editScene(index)">
                    <q-tooltip>{{ $t('playlists.tracksView.editScene') }}</q-tooltip>
                  </q-btn>
                  <q-btn dense flat round size="sm" icon="delete" color="grey-7" @click="removeVideo(index, clip)">
                    <q-tooltip>{{ $t('common.remove') }}</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- 비활성(창 수 도달) 시 이유는 툴팁으로 -->
              <span class="inline-block">
                <q-btn
                  flat
                  dense
                  icon="add"
                  :label="$t('playlists.tracksView.addVideo')"
                  color="grey-7"
                  class="add-video-btn"
                  :disable="!canAddVideo(scene)"
                  @click="addVideo(index)"
                />
                <q-tooltip v-if="!canAddVideo(scene)">
                  {{ $t('playlists.tracksView.oneVideoPerWindow', { n: windowList.length }) }}
                </q-tooltip>
              </span>
            </div>

            <!-- 오디오 영역: 기본 접힘. 헤더 한 줄 클릭 시 채널 리스트 + 추가 -->
            <div class="audio-section">
              <div class="audio-section-head cursor-pointer" @click="toggleAudio(index)">
                <q-icon name="graphic_eq" size="16px" color="grey-7" />
                <span class="text-caption text-weight-medium q-ml-xs">{{ $t('playlists.tracksView.audio') }}</span>
                <span v-if="sceneAudioChannels(scene)" class="text-caption text-muted q-ml-xs">
                  · {{ $t('playlists.tracksView.audioCount', { n: sceneAudioChannels(scene) }) }}
                </span>
                <q-space />
                <q-icon
                  :name="isAudioOpen(index) ? 'expand_less' : 'expand_more'"
                  size="18px"
                  color="grey-7"
                />
              </div>
              <div v-show="isAudioOpen(index)">
                <SceneAudioList
                  :scene="scene"
                  :scene-idx="index"
                  :on-patch-clip="(win, p) => patchClip(index, win, p)"
                  :on-patch-audios="(audios) => persistSceneAudios(index, audios)"
                />
                <q-btn
                  flat
                  dense
                  icon="add"
                  :label="$t('playlists.tracksView.addAudio')"
                  color="grey-7"
                  class="add-audio-btn"
                  @click="addAudio(index)"
                />
              </div>
            </div>
          </div>
        </q-card>
      </template>
    </Draggable>
  </div>
</template>

<style scoped>
.scene-idx {
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
  background: var(--surface-3);
  color: var(--text-2);
  flex: 0 0 auto;
}
.scene-summary {
  white-space: nowrap;
}
.scene-card {
  background: var(--surface-1);
  border-radius: var(--radius-md);
}
.scene-card--active {
  border-color: var(--accent);
  border-left: 3px solid var(--accent);
  background: var(--accent-weak, rgba(59, 130, 246, 0.1));
  box-shadow: 0 0 0 1px var(--accent) inset;
}
.scene-head {
  padding: 6px 10px;
  gap: 8px;
  border-bottom: 1px solid var(--border);
}
.scene-no {
  color: var(--text-1);
  min-width: 0;
  max-width: 16rem;
}
.clip-list {
  padding: 6px 10px;
}
.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted, #999);
  margin-bottom: 2px;
}
.clip-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px solid var(--border);
}
.clip-thumb {
  width: 72px;
  height: 42px;
  border-radius: var(--radius-sm);
  background: var(--surface-3);
  cursor: pointer;
  flex: 0 0 auto;
}
.clip-main {
  flex: 1;
  min-width: 0;
}
.clip-name {
  font-size: 13px;
  color: var(--text-1);
}
.mini-select,
.mini-num {
  background: var(--surface-2);
  color: var(--text-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 12px;
  padding: 2px 4px;
  outline: none;
}
.mini-num {
  width: 64px;
  text-align: right;
}
.mini-select:focus,
.mini-num:focus {
  border-color: var(--accent);
}
.add-video-btn,
.add-audio-btn {
  margin-top: 6px;
}
.audio-section {
  border-top: 2px solid var(--border-strong);
  padding: 6px 10px 8px;
  background: var(--surface-0);
}
.audio-section-head {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}
</style>
