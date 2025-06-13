<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { useApiStore } from 'src/stores/useApi'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import Draggable from 'vuedraggable'
import editImageShowTime from '../dialogs/editImageShowTime.vue'

const $q = useQuasar()
const { playlists, currentPlaylist } = storeToRefs(usePlaylistStore())
const { getAddr } = useApiStore()
const { pStatus } = storeToRefs(useStatusStore())

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
      tracks: newOrder.map((track) => ({ uuid: track.uuid, time: track.time || 0 })),
    })
  } catch (error) {
    console.error('Failed to update track order:', error)
  }
}

// 현재 트랙이 재생 중인지 확인
const isTrackPlaying = (trackIndex) => {
  // playlist에서 uuid로 playlistId 찾기
  const playlist = playlists.value.find((p) => p._id === currentPlaylist.value)
  return (
    playlist.playlistId === pStatus.value.currentPlaylistId &&
    pStatus.value.playlistTrackIndex === trackIndex
  )
}

const playDirectly = (track) => {
  usePlaylistStore().playlistPlay(usePlaylistStore().getCurrentPlaylistId(), track)
}

const editTime = (track, index) => {
  $q.dialog({
    component: editImageShowTime,
    componentProps: {
      time: track.time || 0,
    },
    persistent: true,
  }).onOk(async (time) => {
    try {
      await usePlaylistStore().updateImageTime(currentPlaylist.value, index, time)
    } catch (error) {
      console.error('Error updating track time:', error)
    }
  })
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
          :class="isTrackPlaying(index) ? 'bg-yellow-2' : 'bg-grey-2'"
          style="border-radius: 8px; margin-bottom: 4px; background-color: #f9f9f9"
        >
          <q-item-section avatar>
            <q-img
              v-if="element.mimetype.startsWith('image/') || element.mimetype.startsWith('video/')"
              :src="`${getAddr()}/api/files/thumbnail/${element.uuid}`"
              style="width: 50px; height: 30px"
            />
            <q-icon
              v-else
              name="play_arrow"
              size="2rem"
              color="primary"
              style="width: 50px; height: 30px"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ element.filename }}</q-item-label>
            <q-item-section caption v-if="element.time"
              ><div class="text-caption text-grey-8">
                <span>Time:</span> <span>{{ element.time }}</span>
              </div>
            </q-item-section>
          </q-item-section>
          <q-item-section side>
            <div class="row no-wrap items-center">
              <q-btn
                v-if="element.is_image"
                flat
                round
                color="primary"
                icon="edit"
                size="sm"
                @click="editTime(element, index)"
              ></q-btn>
              <q-btn
                flat
                round
                color="primary"
                icon="play_arrow"
                size="sm"
                @click.stop="playDirectly(index)"
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
.track-playing {
  background-color: #ff0000; /* 회색 배경 */
}
.track-item {
  transition: background-color 0.3s;
}

.track-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
