<script setup>
import { computed } from 'vue'
// components
import DelayedTooltip from '/src/components/delayedTooltip.vue'
// pinia
import { useStatusStore } from '/src/stores/useStatus.js'
import { usePlayerStore } from '/src/stores/usePlayer.js'
import { storeToRefs } from 'pinia'
const { pStatus } = storeToRefs(useStatusStore())
const { fnPlay, fnStop, fnPause, fnSetFullscreen, fnPrev, fnNext, setRepeat } = usePlayerStore()

const current = computed(() => {
  return (
    pStatus.value.player?.[pStatus.value.activePlayerId] || {
      time: 0,
      duration: 0,
      file: {},
      is_playing: 0,
    }
  )
})

// methods
const rotateRepeat = async () => {
  await setRepeat()
}
</script>

<template>
  <div class="row no-wrap justify-center items-center q-mb-sm q-gutter-x-md">
    <!-- rewind -->
    <div v-if="pStatus.playlistMode">
      <q-btn flat round icon="fast_rewind" color="primary" @click="fnPrev">
        <DelayedTooltip msg="Rewind" />
      </q-btn>
    </div>
    <!-- play button -->
    <div>
      <q-btn
        v-if="current.is_playing !== 1"
        flat
        round
        icon="play_arrow"
        color="primary"
        @click="fnPlay()"
      >
        <DelayedTooltip msg="Play" />
      </q-btn>
      <q-btn v-else flat round icon="pause" color="primary" @click="fnPause">
        <DelayedTooltip msg="Pause" />
      </q-btn>
    </div>
    <!-- stop button -->
    <div>
      <q-btn flat round icon="stop" color="red-10" @click="fnStop()">
        <DelayedTooltip msg="Stop" />
      </q-btn>
    </div>
    <!-- Next button -->
    <div v-if="pStatus.playlistMode">
      <q-btn flat round icon="fast_forward" color="primary" @click="fnNext">
        <DelayedTooltip msg="Next" />
      </q-btn>
    </div>
    <!-- repeat -->
    <div>
      <q-btn
        v-if="pStatus.repeat === 'none'"
        flat
        round
        icon="repeat"
        color="grey-5"
        @click="rotateRepeat"
      >
        <DelayedTooltip msg="None" />
      </q-btn>
      <q-btn
        v-else-if="pStatus.repeat === 'all'"
        flat
        round
        icon="repeat"
        color="primary"
        @click="rotateRepeat"
      >
        <DelayedTooltip msg="Repeat" />
      </q-btn>
      <q-btn
        v-else-if="pStatus.playlistMode && pStatus.repeat === 'repeat_one'"
        flat
        round
        icon="repeat_one"
        color="primary"
        @click="rotateRepeat"
      >
        <DelayedTooltip msg="Repeat One" />
      </q-btn>
      <q-btn
        v-else-if="pStatus.repeat === 'single'"
        flat
        round
        icon="looks_one"
        color="primary"
        @click="rotateRepeat"
      >
        <DelayedTooltip msg="Single" />
      </q-btn>
    </div>

    <!-- fullscreen button -->
    <div>
      <q-btn
        flat
        round
        :icon="pStatus && pStatus.fullscreen ? 'fullscreen_exit' : 'fullscreen'"
        color="primary"
        @click="fnSetFullscreen(!pStatus.fullscreen)"
      >
        <DelayedTooltip :msg="pStatus && pStatus.fullscreen ? 'Exit Fullscreen' : 'Fullscreen'" />
      </q-btn>
    </div>
  </div>
</template>

<style scoped></style>
