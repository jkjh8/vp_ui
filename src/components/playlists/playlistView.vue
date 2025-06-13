<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { storeToRefs } from 'pinia'
import addPlaylist from 'src/components/dialogs/addPlaylist.vue'
import confirmDialog from 'src/components/dialogs/confirmDialog.vue'

const playlistStore = usePlaylistStore()
const { playlists, currentPlaylist } = storeToRefs(playlistStore)

const $q = useQuasar()

const editPlaylist = (playlist) => {
  $q.dialog({
    component: addPlaylist,
    componentProps: {
      initialData: playlist,
    },
  }).onOk(async (data) => {
    await playlistStore.updatePlaylist(data._id, {
      name: data.name,
      description: data.description,
      playlistId: data.playlistId,
    })
    await playlistStore.getPlaylists()
    $q.notify({
      type: 'positive',
      message: 'Playlist updated successfully.',
    })
  })
}

const onDeletePlaylist = (item) => {
  $q.dialog({
    component: confirmDialog,
    componentProps: {
      title: 'Delete Playlist',
      message: `Are you sure you want to delete the playlist "${item.name}"?`,
    },
  }).onOk(() => {
    playlistStore.deletePlaylist(item._id)
  })
}

onMounted(() => {
  playlistStore.getPlaylists()
})
</script>

<template>
  <div class="q-pa-md">
    <div v-if="!playlists || playlists.length === 0" class="text-center text-grey-7 q-pa-lg">
      <span>No playlists available.</span>
    </div>
    <q-list v-else class="q-pa-none q-mt-none">
      <q-item
        v-for="(item, index) in playlists"
        :key="index"
        :class="{
          active: currentPlaylist === item._id,
          'bg-yellow-2': currentPlaylist === item._id,
        }"
        style="border-radius: 1rem; margin-bottom: 0.5rem"
        clickable
        @click="playlistStore.changeCurrentPlaylist(item._id)"
      >
        <q-item-section avatar>
          <q-avatar>
            <q-icon name="playlist_play" color="primary" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="q-gutter-x-xs">
            <span class="text-bold">{{ item.name }}</span>
            <span class="text-caption"> ID: {{ item.playlistId }} </span>
          </q-item-label>
          <q-item-label caption>{{ item.description }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center">
            <q-btn
              flat
              round
              size="sm"
              icon="edit"
              color="primary"
              @click.stop.prevent="editPlaylist(item)"
            ></q-btn>
            <q-btn
              flat
              round
              size="sm"
              icon="delete"
              color="negative"
              @click.stop.prevent="onDeletePlaylist(item)"
            ></q-btn>
            <q-separator vertical class="q-mx-sm" />
            <q-btn
              flat
              round
              size="sm"
              icon="play_arrow"
              color="primary"
              @click.stop.prevent="playlistStore.playlistPlay(item.playlistId)"
            ></q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped>
.empty-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: #9e9e9e; /* Quasar의 text-grey-5와 유사 */
  font-size: 1.1rem;
  text-align: center;
}
</style>
