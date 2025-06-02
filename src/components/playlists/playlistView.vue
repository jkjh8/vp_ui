<script setup>
import { onMounted } from 'vue'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { storeToRefs } from 'pinia'
const playlistStore = usePlaylistStore()
const { playlists, currentPlaylist } = storeToRefs(playlistStore)

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
          <div class="row items-center q-gutter-x-xs">
            <q-icon
              class="cursor-pointer"
              name="edit"
              size="xs"
              color="primary"
              @click.stop.prevent="playlistStore.editPlaylist(item._id)"
            />
            <q-icon
              class="cursor-pointer"
              name="delete"
              size="xs"
              color="negative"
              @click.stop.prevent="playlistStore.deletePlaylist(item._id)"
            />
            <q-separator vertical />
            <q-icon
              class="cursor-pointer"
              name="play_arrow"
              size="sm"
              color="primary"
              @click.stop.prevent="playlistStore.playPlaylist(item._id)"
            />
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
