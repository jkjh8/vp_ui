<script setup>
// 플레이리스트 편집 헤더 — 편집할 플레이리스트 선택(에디터 구동) + 액션(로딩/재생/트랙추가/편집/삭제/신규).
// 장면/윈도우 모드 토글은 우측. 재생/프리로드/모드 로직은 usePlayback 파사드 경유,
// 프리로드 배지는 ui/PreloadBadge 공용.
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import DelayedTooltip from '../DelayedTooltip.vue'
import PreloadBadge from '../ui/PreloadBadge.vue'
import addPlaylist from '../dialogs/addPlaylist.vue'
import trackEditor from '../dialogs/trackEditor.vue'
import { toPersistedTrack, toPersistedWindowTracks } from 'src/composables/useTracks'
import confirmDialog from '../dialogs/confirmDialog.vue'
import { usePlayback } from 'src/composables/usePlayback'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const $q = useQuasar()
const playlistStore = usePlaylistStore()
const { playlists, currentPlaylist } = storeToRefs(playlistStore)
// 모드 토글은 상단 헤더(MainLayout)가 담당한다(currentPlaylist에 작용).
const { preload, launchPlaylist, isLoadedFor, isReadyFor, globalMode } = usePlayback()

const current = computed(() => playlists.value.find((p) => p._id === currentPlaylist.value))

const plMode = (p) => (p?.mode === 'window' ? 'window' : 'scene')
const typeLabel = (p) =>
  plMode(p) === 'window' ? t('playlists.playlistHeader.window') : t('playlists.playlistHeader.scene')

// 프리로딩 배지 (선택한 플레이리스트 기준)
const loadedHere = computed(() => !!current.value && isLoadedFor(current.value.playlistId))
const readyHere = computed(() => !!current.value && isReadyFor(current.value.playlistId))

// 현재 작업 모드(전역) 우선 정렬 기준
const sortMode = computed(() => (current.value ? plMode(current.value) : globalMode.value))
const options = computed(() =>
  [...playlists.value]
    .sort(
      (a, b) => (plMode(a) === sortMode.value ? 0 : 1) - (plMode(b) === sortMode.value ? 0 : 1),
    )
    .map((p) => ({
      label: t('playlists.playlistHeader.optionLabel', { name: p.name, id: p.playlistId }),
      value: p._id,
      mode: plMode(p),
    })),
)

const onSelect = (val) => playlistStore.changeCurrentPlaylist(val)

const notifyOk = (m) => $q.notify({ type: 'positive', message: m, position: 'top' })
const notifyErr = (m) => $q.notify({ type: 'negative', message: m, position: 'top' })
const warnNoPlaylist = () =>
  $q.notify({ type: 'warning', message: t('playlists.playlistHeader.warnNoPlaylist'), position: 'top' })

const openAddPlaylist = () => {
  $q.dialog({ component: addPlaylist }).onOk(async (data) => {
    try {
      await playlistStore.addPlaylist(data)
      notifyOk(t('playlists.playlistHeader.playlistCreated', { name: data.name }))
    } catch {
      notifyErr(t('playlists.playlistHeader.createFailed'))
    }
  })
}

const editPlaylist = () => {
  if (!current.value) return warnNoPlaylist()
  $q.dialog({ component: addPlaylist, componentProps: { initialData: current.value } }).onOk(
    async (data) => {
      await playlistStore.updatePlaylist(data._id, {
        name: data.name,
        description: data.description,
        playlistId: data.playlistId,
        mode: data.mode === 'window' ? 'window' : 'scene',
      })
      await playlistStore.getPlaylists()
      notifyOk(t('playlists.playlistHeader.playlistUpdated'))
    },
  )
}

const deletePlaylist = () => {
  if (!current.value) return warnNoPlaylist()
  $q.dialog({
    component: confirmDialog,
    componentProps: {
      title: t('playlists.playlistHeader.deleteTitle'),
      message: t('playlists.playlistHeader.deleteConfirm', { name: current.value.name }),
    },
  }).onOk(() => playlistStore.deletePlaylist(current.value._id))
}

// 트랙 1개 추가 — 영상·오디오를 한 팝업(trackEditor)에서. 윈도우형은 팝업에서 창(레인)을 고른다.
const addTrack = () => {
  if (!current.value) return warnNoPlaylist()
  const mode = plMode(current.value)
  $q.dialog({
    component: trackEditor,
    componentProps: { playlist: current.value, mode },
  }).onOk(async ({ clips, audios, window }) => {
    const existing = current.value.tracks || []
    try {
      if (mode === 'window') {
        const item = clips.length
          ? { clips: [{ ...clips[0], window }], audios }
          : { clips: [], window, audios }
        await playlistStore.updatePlaylist(currentPlaylist.value, {
          tracks: toPersistedWindowTracks([...existing, item]),
          mode: 'window',
        })
      } else {
        await playlistStore.updatePlaylist(currentPlaylist.value, {
          tracks: [...existing.map(toPersistedTrack), toPersistedTrack({ clips, audios })],
        })
      }
      notifyOk(t('playlists.playlistHeader.tracksAdded', { n: 1 }))
    } catch {
      notifyErr(t('playlists.playlistHeader.addTrackFailed'))
    }
  })
}

const play = async () => {
  if (!current.value) return warnNoPlaylist()
  try {
    await launchPlaylist(current.value.playlistId, plMode(current.value))
  } catch {
    notifyErr(t('playlists.playlistHeader.playFailed'))
  }
}

// 플레이리스트 로딩(프리로딩) — 재생 없이 전 트랙 프리롤
const doPreload = async () => {
  if (!current.value) return warnNoPlaylist()
  try {
    await preload(current.value.playlistId)
    notifyOk(t('playlists.playlistHeader.preloadOk'))
  } catch {
    notifyErr(t('playlists.playlistHeader.preloadFailed'))
  }
}
</script>

<template>
  <div class="row items-center no-wrap q-gutter-x-sm">
    <q-select
      :model-value="currentPlaylist"
      @update:model-value="onSelect"
      :options="options"
      option-label="label"
      option-value="value"
      emit-value
      map-options
      dense
      outlined
      class="col q-mr-md"
      style="max-width: 460px"
      :label="$t('playlists.playlistHeader.playlistLabel')"
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge
              outline
              color="grey-7"
              :label="
                scope.opt.mode === 'window'
                  ? $t('playlists.playlistHeader.window')
                  : $t('playlists.playlistHeader.scene')
              "
            />
          </q-item-section>
        </q-item>
      </template>
      <template #after-options>
        <q-separator v-if="playlists.length" />
        <q-item clickable v-close-popup @click="openAddPlaylist">
          <q-item-section avatar><q-icon name="add_box" color="primary" /></q-item-section>
          <q-item-section>{{ $t('playlists.playlistHeader.tooltipNewPlaylist') }}</q-item-section>
        </q-item>
      </template>
    </q-select>
    <!-- ID는 TCP 제어 등에 쓰이므로 상시 표시. 타입은 툴팁으로 -->
    <q-badge
      v-if="current"
      outline
      color="grey-7"
      :label="$t('playlists.playlistHeader.idBadge', { id: current.playlistId })"
      class="q-ml-xs"
    >
      <q-tooltip>{{
        $t('playlists.playlistHeader.idBadgeTip', { type: typeLabel(current) })
      }}</q-tooltip>
    </q-badge>

    <q-space />
    <PreloadBadge :loaded="loadedHere" :ready="readyHere" :show-not-loaded="false" class="q-mr-xs" />
    <q-btn round flat dense color="grey-7" icon="download_for_offline" :disable="!current" @click="doPreload">
      <DelayedTooltip :msg="$t('playlists.playlistHeader.tooltipPreload')" />
    </q-btn>
    <q-btn round flat dense color="primary" icon="play_arrow" :disable="!current" @click="play">
      <DelayedTooltip :msg="$t('playlists.playlistHeader.tooltipPlay')" />
    </q-btn>
    <q-btn round flat dense color="grey-7" icon="format_list_bulleted_add" :disable="!current" @click="addTrack">
      <DelayedTooltip :msg="$t('playlists.playlistHeader.tooltipAddTrack')" />
    </q-btn>
    <q-btn round flat dense color="grey-7" icon="more_vert">
      <q-menu auto-close>
        <q-list dense style="min-width: 180px">
          <q-item clickable @click="openAddPlaylist">
            <q-item-section avatar><q-icon name="add_box" /></q-item-section>
            <q-item-section>{{ $t('playlists.playlistHeader.tooltipNewPlaylist') }}</q-item-section>
          </q-item>
          <q-item clickable :disable="!current" @click="editPlaylist">
            <q-item-section avatar><q-icon name="edit" /></q-item-section>
            <q-item-section>{{ $t('playlists.playlistHeader.tooltipEditPlaylist') }}</q-item-section>
          </q-item>
          <q-item clickable :disable="!current" @click="deletePlaylist">
            <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
            <q-item-section>{{ $t('playlists.playlistHeader.tooltipDeletePlaylist') }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>
