<script setup>
import { computed } from 'vue'
// components
import DelayedTooltip from '/src/components/delayedTooltip.vue'
// pinia
import { useStatusStore } from '/src/stores/useStatus.js'
import { usePlayerStore } from '/src/stores/usePlayer.js'
import { storeToRefs } from 'pinia'
import { socket } from '/src/boot/socketio.js'
const { pStatus } = storeToRefs(useStatusStore())
const { fnPlay, fnStop, fnPause, fnSetFullscreen } = usePlayerStore()

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
const rotateRepeat = () => {
  if (pStatus.value.repeat === 'none') {
    pStatus.value.repeat = 'all'
  } else if (pStatus.value.repeat === 'all') {
    pStatus.value.repeat = pStatus.value.playlistMode ? 'repeat_one' : 'none'
  } else if (pStatus.value.playlistMode && pStatus.value.repeat === 'repeat_one') {
    pStatus.value.repeat = 'single'
  } else if (pStatus.value.repeat === 'single') {
    pStatus.value.repeat = 'none'
  }
  socket.emit('event', { type: 'repeat', value: pStatus.value.repeat })
}
</script>

<template>
  <div class="row no-wrap justify-center items-center q-mb-sm q-gutter-x-md">
    <!-- rewind -->
    <div v-if="pStatus.playlistMode">
      <q-btn flat round icon="fast_rewind" color="primary">
        <DelayedTooltip msg="Rewind" />
      </q-btn>
    </div>
    qu
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
    <!-- forward button -->
    <div v-if="pStatus.playlistMode">
      <q-btn flat round icon="fast_forward" color="primary">
        <DelayedTooltip msg="Forward" />
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
        v-if="pStatus.player && pStatus.player.fullscreen"
        flat
        round
        icon="fullscreen_exit"
        color="primary"
        @click="fnSetFullscreen(!pStatus.player.fullscreen)"
      >
        <DelayedTooltip msg="Exit Fullscreen" />
      </q-btn>
      <q-btn
        v-else
        flat
        round
        icon="fullscreen"
        color="primary"
        @click="fnSetFullscreen(!pStatus.player.fullscreen)"
      >
        <DelayedTooltip msg="Fullscreen" />
      </q-btn>
    </div>
  </div>
</template>

<style scoped></style>
