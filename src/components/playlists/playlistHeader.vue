<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
// import { usePlaylistStore } from 'src/stores/usePlaylist'
import delayedTooltip from '../delayedTooltip.vue'
import addPlaylist from '../dialogs/addPlaylist.vue'
import addTracks from '../dialogs/addTracks.vue'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { storeToRefs } from 'pinia'

const $q = useQuasar()
const playlistStore = usePlaylistStore()
const { playlists, currentPlaylist } = storeToRefs(playlistStore)

const playlist = computed(() => {
  return playlistStore.playlists.find((p) => p._id === currentPlaylist.value)
})

// 플레이리스트 추가 다이얼로그 열기
const openAddPlaylistDialog = () => {
  $q.dialog({
    component: addPlaylist,
  })
    .onOk(async (playlistData) => {
      try {
        await usePlaylistStore().addPlaylist(playlistData)
        $q.notify({
          type: 'positive',
          message: `플레이리스트 "${playlistData.name}"이 생성되었습니다.`,
          position: 'top',
        })
      } catch (error) {
        console.error('플레이리스트 생성 실패:', error)
        $q.notify({
          type: 'negative',
          message: '플레이리스트 생성에 실패했습니다.',
          position: 'top',
        })
      }
    })
    .onCancel(() => {
      console.log('플레이리스트 생성 취소됨')
    })
}

const openAddTrackDialog = () => {
  // 선택된 플레이리스트가 있는 지 확인
  if (!currentPlaylist.value) {
    $q.notify({
      type: 'warning',
      message: 'Please select a playlist first.',
      position: 'top',
    })
    return
  }
  $q.dialog({
    component: addTracks,
    componentProps: {
      playlists: playlists.value,
      playlist: playlist.value,
      currentPlaylist: currentPlaylist.value,
    },
  })
    .onOk(async (tracks) => {
      try {
        if (!tracks || tracks.length === 0) {
          $q.notify({
            type: 'warning',
            message: '추가할 트랙이 없습니다.',
            position: 'top',
          })
          return
        }
        await usePlaylistStore().updateTracksInPlaylist(currentPlaylist.value, tracks)
        $q.notify({
          type: 'positive',
          message: `트랙 "${tracks.map((track) => track.filename).join(', ')}"이 추가되었습니다.`,
          position: 'top',
        })
      } catch (error) {
        console.error('트랙 추가 실패:', error)
        $q.notify({
          type: 'negative',
          message: '트랙 추가에 실패했습니다.',
          position: 'top',
        })
      }
    })
    .onCancel(() => {
      console.log('트랙 추가 취소됨')
    })
}
</script>

<template>
  <div class="row no-wrap justify-between items-center">
    <div class="row no-wrap items-center q-gutter-x-sm">
      <q-icon name="list_alt" size="md" color="primary" />
      <div class="text-title">Playlist</div>
    </div>
    <div class="row no-wrap items-center q-gutter-x-sm">
      <q-btn round flat color="primary" icon="add_box" @click="openAddPlaylistDialog">
        <delayed-tooltip msg="Add Playlist" />
      </q-btn>

      <q-separator vertical />
      <!-- add track -->
      <q-btn round flat color="primary" icon="format_list_bulleted_add" @click="openAddTrackDialog">
        <delayed-tooltip msg="Add Track" />
      </q-btn>
    </div>
  </div>
</template>

<style scoped></style>
