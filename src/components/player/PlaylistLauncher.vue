<script setup>
// 플레이리스트 런치 — 플레이리스트를 골라 로딩(프리로드)/재생. usePlayback 경유.
// 홈 컨트롤 센터 + PlaylistPage 헤더 공용.
import { onMounted, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import DelayedTooltip from 'src/components/DelayedTooltip.vue'
import PreloadBadge from 'src/components/ui/PreloadBadge.vue'
import { usePlayback } from 'src/composables/usePlayback'

const { t } = useI18n()
const $q = useQuasar()
const { playlists, getPlaylists, preload, launchPlaylist, isLoadedFor, isReadyFor, pStatus } =
  usePlayback()

const sel = ref(null)

onMounted(async () => {
  if (!playlists.value.length) await getPlaylists()
  if (pStatus.value.playlist?.playlistId != null) sel.value = pStatus.value.playlist.playlistId
  else if (playlists.value.length) sel.value = playlists.value[0].playlistId
})

const options = computed(() =>
  playlists.value.map((p) => ({
    label: `${p.name}  ·  ID ${p.playlistId}`,
    value: p.playlistId,
    mode: p.mode === 'window' ? 'window' : 'scene',
  })),
)
const selOpt = computed(() => options.value.find((o) => o.value === sel.value) || null)
const selMode = computed(() => selOpt.value?.mode || 'scene')

const loadedHere = computed(() => isLoadedFor(sel.value))
const readyHere = computed(() => isReadyFor(sel.value))
const playingHere = computed(
  () =>
    sel.value != null &&
    pStatus.value.playlist?.playlistId === sel.value &&
    Object.keys(pStatus.value.windowStates || {}).length > 0,
)

const notifyErr = (m) => $q.notify({ type: 'negative', message: m, position: 'top' })
const notifyOk = (m) => $q.notify({ type: 'positive', message: m, position: 'top' })

const doLoad = async () => {
  if (sel.value == null) return
  try {
    await preload(sel.value)
    notifyOk(t('controls.homePlaylistLaunch.loadedToMemory'))
  } catch {
    notifyErr(t('controls.homePlaylistLaunch.loadFailed'))
  }
}
const doPlay = async () => {
  if (sel.value == null) return
  try {
    const ok = await launchPlaylist(sel.value, selMode.value)
    if (!ok) return
  } catch {
    notifyErr(t('controls.homePlaylistLaunch.playFailed'))
  }
}
</script>

<template>
  <div class="row items-center no-wrap q-gutter-x-sm full-width">
    <q-select
      :model-value="sel"
      @update:model-value="(v) => (sel = v)"
      :options="options"
      option-label="label"
      option-value="value"
      emit-value
      map-options
      dense
      outlined
      class="col"
      :label="$t('controls.homePlaylistLaunch.playlistLabel')"
      :disable="!options.length"
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
                  ? $t('controls.homePlaylistLaunch.modeWindow')
                  : $t('controls.homePlaylistLaunch.modeScene')
              "
            />
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <PreloadBadge
      :loaded="loadedHere"
      :ready="readyHere"
      :playing="playingHere"
      :show-not-loaded="false"
    />

    <q-btn round flat color="primary" icon="download_for_offline" :disable="sel == null" @click="doLoad">
      <DelayedTooltip :msg="$t('controls.homePlaylistLaunch.loadTooltip')" />
    </q-btn>
    <q-btn round flat color="primary" icon="play_arrow" :disable="sel == null" @click="doPlay">
      <DelayedTooltip :msg="$t('controls.homePlaylistLaunch.play')" />
    </q-btn>
  </div>
</template>

<style scoped></style>
