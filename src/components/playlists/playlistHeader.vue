<script setup>
import { useQuasar } from 'quasar'
// import { usePlaylistStore } from 'src/stores/usePlaylist'
import delayedTooltip from '../delayedTooltip.vue'
import addPlaylist from '../dialogs/addPlaylist.vue'

const $q = useQuasar()
// const playlistStore = usePlaylistStore()

// 플레이리스트 추가 다이얼로그 열기
const openAddPlaylistDialog = () => {
  $q.dialog({
    component: addPlaylist,
  })
    .onOk(async (playlistData) => {
      try {
        console.log('새 플레이리스트 생성됨:', playlistData)
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
      <q-btn round flat color="primary" icon="format_list_bulleted_add">
        <delayed-tooltip msg="Add Track" />
      </q-btn>
    </div>
  </div>
</template>

<style scoped></style>
