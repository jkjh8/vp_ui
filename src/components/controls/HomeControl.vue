<script setup>
import { computed } from 'vue'
import ControlBtns from './controlBtns.vue'
import TimeSlider from './timeSlider.vue'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import { humanReadableFileSize } from 'src/composables/useUtils'
import { firstCharUpperCase } from 'src/composables/useUtils'
import { msToHMS } from 'src/composables/useTime'
import { useApiStore } from 'src/stores/useApi'

const { pStatus } = storeToRefs(useStatusStore())
const { getAddr } = useApiStore()

const currentPlayer = computed(() => {
  return pStatus.value.player[pStatus.value.activePlayerId]
})
</script>

<template>
  <div class="flex flex-center" style="min-height: 80vh">
    <q-card flat>
      <q-card-section>
        <div class="row justify-center">
          <div class="row items-center q-gutter-x-md">
            <div>
              <q-img
                :src="`${getAddr()}/api/files/thumbnail/${currentPlayer.file?.uuid}`"
                style="
                  width: 320px;
                  border: 1px solid #ccc;
                  background: #fff;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                "
                alt="Mountains"
              />
            </div>
            <div>
              <div class="text-subtitle2">Current File is...</div>
              <div v-if="pStatus.playlistMode" class="text-bold text-primary">
                - Playlist Mode -
              </div>
              <div v-if="currentPlayer.file" class="">
                <div class="q-gutter-x-xs">
                  <span> File: </span>
                  <span class="text-subtitle2 text-primary">
                    {{ currentPlayer.file.filename }}
                  </span>
                </div>
                <div class="q-gutter-x-xs">
                  <span> Size: </span>
                  <span class="text-subtitle2 text-primary">
                    {{ humanReadableFileSize(currentPlayer.file.size) }}
                  </span>
                </div>
                <div class="q-gutter-x-xs">
                  <span> Play ID: </span>
                  <span class="text-subtitle2 text-primary">
                    {{ currentPlayer.file.number }}
                  </span>
                </div>
                <div class="q-gutter-x-xs">
                  <span> Type: </span>
                  <span class="text-subtitle2 text-primary">
                    {{ firstCharUpperCase(currentPlayer.file.mimetype) }}
                  </span>
                </div>
                <div class="q-gutter-x-xs">
                  <span> Duration: </span>
                  <span class="text-subtitle2 text-primary">
                    {{ msToHMS(currentPlayer.duration / 1000) }}
                  </span>
                </div>
                <div class="q-gutter-x-xs">
                  <span> Time: </span>
                  <span class="text-subtitle2 text-primary">
                    {{ msToHMS(currentPlayer.time / 1000) }}
                  </span>
                </div>
              </div>
              <div v-else>
                <em class="text-grey">No file selected</em>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div>
          <div class="q-mt-md">
            <TimeSlider :time="false" />
          </div>
          <div class="row justify-center q-gutter-md">
            <ControlBtns />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped></style>
