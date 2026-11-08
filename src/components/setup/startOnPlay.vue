<script setup>
import { computed, onMounted } from 'vue'
import SettingRow from 'src/components/ui/SettingRow.vue'
import { useQuasar } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { useApiStore } from 'src/stores/useApi'
import { storeToRefs } from 'pinia'
import ListPickerDialog from '../ui/ListPickerDialog.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const $q = useQuasar()
const { apiCallWithLoading } = useApiStore()
const { pStatus } = storeToRefs(useStatusStore())
const { playlists } = storeToRefs(usePlaylistStore())

const startPlaylistName = computed(
  () =>
    playlists.value.find((p) => p.playlistId === pStatus.value.startOnPlaylistId)?.name ||
    t('setup.startOnPlay.unknown'),
)

const updateStartOnPlay = async (value) => {
  try {
    await apiCallWithLoading(
      '/playlist/start_on_play',
      'PUT',
      { value },
      t('setup.startOnPlay.updatingBoot'),
    )
    pStatus.value.startOnPlay = value
    $q.notify({ type: 'positive', message: t('setup.startOnPlay.bootUpdated') })
  } catch (error) {
    console.error('Error updating startOnPlay:', error)
    $q.notify({ type: 'negative', message: t('setup.startOnPlay.bootFailed') })
  }
}

const openSelectPlaylistDialog = () => {
  $q.dialog({
    component: ListPickerDialog,
    componentProps: {
      title: t('dialogs.selectPlaylist.title'),
      icon: 'playlist_play',
      options: playlists.value,
      optionLabel: 'name',
      optionValue: 'playlistId',
      modelValue: pStatus.value.startOnPlaylistId,
    },
  }).onOk(async (playlistId) => {
    try {
      await apiCallWithLoading(
        '/playlist/start_on_playlist_id',
        'PUT',
        { playlistId },
        t('setup.startOnPlay.updatingPlaylist'),
      )
      pStatus.value.startOnPlaylistId = playlistId
      $q.notify({ type: 'positive', message: t('setup.startOnPlay.playlistUpdated') })
    } catch (error) {
      console.error('Error updating startOnPlaylist:', error)
      $q.notify({ type: 'negative', message: t('setup.startOnPlay.playlistFailed') })
    }
  })
}

onMounted(async () => {
  try {
    await usePlaylistStore().getPlaylists()
  } catch (error) {
    console.error('Error fetching playlists:', error)
  }
})
</script>

<template>
  <SettingRow icon="play_arrow" :label="$t('setup.startOnPlay.bootTitle')">
    <template #control>
      <q-toggle v-model="pStatus.startOnPlay" color="primary" @update:model-value="updateStartOnPlay" />
    </template>
  </SettingRow>

  <SettingRow
    v-if="pStatus.startOnPlay"
    icon="list"
    :label="$t('setup.startOnPlay.playlistTitle')"
    :caption="startPlaylistName"
  >
    <template #control>
      <q-btn round flat color="primary" icon="edit" @click="openSelectPlaylistDialog" />
    </template>
  </SettingRow>
</template>

<style scoped></style>
