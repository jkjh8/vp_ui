<script setup>
// 플레이어 원격 관리 다이얼로그 — 슬레이브의 재생목록을 fleet 프록시로 조회/재생/삭제하고,
// 파일 등 전체 관리는 "전체 UI 열기"로 슬레이브 자체 웹 UI를 새 탭에서 연다.
import { ref, onMounted } from 'vue'
import { useFleet } from 'src/composables/useFleet'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const props = defineProps({ player: { type: Object, required: true } })
const emit = defineEmits(['close'])
const { t } = useI18n()
const $q = useQuasar()
const fleet = useFleet()

const playlists = ref([])
const load = async () => {
  playlists.value = await fleet.fetchPlaylists(props.player.id)
}
const openFullUi = () =>
  window.open(`http://${props.player.ip}:${props.player.restPort}`, '_blank', 'noopener')

const playRemote = async (pl) => {
  try {
    await fleet
      .playerApi(props.player.id)
      .get('/playlist/play', { params: { playlistId: pl.playlistId } })
    $q.notify({ type: 'positive', message: pl.name })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  }
}
const delRemote = async (pl) => {
  try {
    await fleet.playerApi(props.player.id).delete('/playlist/' + pl.playlistId)
    await load()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  }
}

onMounted(load)
</script>

<template>
  <q-dialog :model-value="true" @hide="emit('close')">
    <q-card style="min-width: 440px; max-width: 92vw">
      <q-card-section class="row items-center">
        <q-icon name="desktop_windows" class="q-mr-sm" />
        <div class="text-bold">{{ player.name }}</div>
        <div class="text-caption text-muted q-ml-sm">{{ player.ip }}:{{ player.restPort }}</div>
        <q-space />
        <q-btn
          dense
          flat
          icon="open_in_new"
          :label="t('fleet.manageFiles')"
          @click="openFullUi"
        />
        <q-btn dense flat round icon="close" @click="emit('close')" />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="text-caption text-muted q-mb-sm">{{ t('fleet.managePlaylists') }}</div>
        <q-list bordered separator>
          <q-item v-for="pl in playlists" :key="pl.playlistId">
            <q-item-section>
              <q-item-label>{{ pl.name }}</q-item-label>
              <q-item-label caption>{{ pl.mode }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn dense flat round icon="play_arrow" color="positive" @click="playRemote(pl)" />
                <q-btn dense flat round icon="delete" color="negative" @click="delRemote(pl)" />
              </div>
            </q-item-section>
          </q-item>
          <q-item v-if="!playlists.length">
            <q-item-section class="text-muted">{{ t('fleet.none') }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
