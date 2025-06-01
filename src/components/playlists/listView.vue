<script setup>
import { computed } from 'vue'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { storeToRefs } from 'pinia'

const { playlists, currentPlaylist } = storeToRefs(usePlaylistStore())

const currentTracks = computed(() => {
  const playlist = playlists.value?.find((p) => p._id === currentPlaylist.value)
  return playlist?.tracks || []
})

const hasPlaylist = computed(() => {
  return currentPlaylist.value && playlists.value?.some((p) => p._id === currentPlaylist.value)
})
</script>

<template>
  <div class="q-pa-md">
    <div v-if="!hasPlaylist" class="text-center text-grey-7 q-pa-lg">
      플레이리스트가 선택되지 않았습니다.
    </div>
    <div v-else-if="currentTracks.length === 0" class="text-center text-grey-7 q-pa-lg">
      트랙이 없습니다.
    </div>
    <q-list v-else bordered separator>
      <q-item
        v-for="(track, idx) in currentTracks"
        :key="idx"
        clickable
        style="border-radius: 8px; margin-bottom: 4px"
      >
        <q-item-section>
          <q-item-label>{{ track.name }}</q-item-label>
          <q-item-label caption>{{ track.path }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            round
            color="primary"
            icon="play_arrow"
            @click.stop="playlistStore.playTrack(track)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped>
.q-item {
  transition: background-color 0.3s;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
