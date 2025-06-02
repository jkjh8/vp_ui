<script setup>
import { computed } from 'vue'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { useApiStore } from 'src/stores/useApi'
import { storeToRefs } from 'pinia'
import Draggable from 'vuedraggable'

const { playlists, currentPlaylist } = storeToRefs(usePlaylistStore())
const { getAddr } = useApiStore()

const currentTracks = computed({
  get() {
    const playlist = playlists.value?.find((p) => p._id === currentPlaylist.value)
    return playlist?.tracks || []
  },
  set(newTracks) {
    const playlist = playlists.value?.find((p) => p._id === currentPlaylist.value)
    if (playlist) {
      playlist.tracks = newTracks
    }
  },
})

const hasPlaylist = computed(() => {
  return currentPlaylist.value && playlists.value?.some((p) => p._id === currentPlaylist.value)
})

const updateTrackOrder = async (newOrder) => {
  const playlistStore = usePlaylistStore()
  try {
    await playlistStore.updatePlaylist(currentPlaylist.value, {
      tracks: newOrder.map((track) => track.uuid),
    })
    console.log('Track order updated successfully')
  } catch (error) {
    console.error('Failed to update track order:', error)
  }
}
</script>

<template>
  <div>
    <div v-if="!hasPlaylist" class="text-center text-grey-7 q-pa-lg">
      <span>No playlist selected.</span>
    </div>
    <div v-else-if="currentTracks.length === 0" class="text-center text-grey-7 q-pa-lg">
      <span>No tracks available.</span>
    </div>
    <Draggable
      v-else
      v-model="currentTracks"
      @end="updateTrackOrder(currentTracks)"
      item-key="uuid"
      group="tracks"
      animation="200"
    >
      <template #item="{ element, index }">
        <q-item
          :key="index"
          clickable
          style="border-radius: 8px; margin-bottom: 4px; background-color: #f9f9f9"
        >
          <q-item-section avatar>
            <q-img
              :src="`${getAddr()}/api/files/thumbnail/${element.uuid}`"
              style="width: 50px; height: 30px"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ element.filename }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row no-wrap items-center">
              <q-btn
                flat
                round
                color="primary"
                icon="play_arrow"
                size="sm"
                @click.stop="usePlaylistStore().playTrackFromPlaylist(currentPlaylist, element)"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click.stop="usePlaylistStore().removeTrackFromPlaylist(currentPlaylist, index)"
              />
            </div>
          </q-item-section>
        </q-item>
      </template>
    </Draggable>
  </div>
</template>

<style scoped>
.track-item {
  transition: background-color 0.3s;
}

.track-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
