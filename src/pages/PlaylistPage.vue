<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import playlistHeader from 'src/components/playlists/playlistHeader.vue'
import listView from 'src/components/playlists/TracksView.vue'
import WindowTracksView from 'src/components/playlists/WindowTracksView.vue'

const playlistStore = usePlaylistStore()
const { playlists, currentPlaylist } = storeToRefs(playlistStore)

// 현재 선택된 플레이리스트의 타입에 따라 에디터를 고른다 (장면형/윈도우형).
const currentMode = computed(() => {
  const p = playlists.value.find((x) => x._id === currentPlaylist.value)
  return p?.mode === 'window' ? 'window' : 'scene'
})

onMounted(async () => {
  await playlistStore.getPlaylists()
  // Always jump to the first playlist when the page opens, if one exists
  if (playlists.value.length > 0) {
    playlistStore.changeCurrentPlaylist(playlists.value[0]._id)
  }
})
</script>

<template>
  <q-page padding>
    <div class="app-card q-pa-md">
      <playlistHeader />
      <q-separator class="q-my-sm" />
      <WindowTracksView v-if="currentMode === 'window'" />
      <listView v-else />
    </div>
  </q-page>
</template>

<style scoped></style>
