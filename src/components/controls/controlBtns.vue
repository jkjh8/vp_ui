<script setup>
// components
import DelayedTooltip from '/src/components/delayedTooltip.vue'
// pinia
import { useStatusStore } from '/src/stores/useStatus.js'

const { pStatus } = useStatusStore()
// composables
// import { fnPlay, fnPause, fnStop, setFullscreen } from '/src/composables/usePlayer'
</script>

<template>
  <div class="row no-wrap justify-center items-center q-mb-sm q-gutter-x-md">
    <!-- rewind -->
    <div>
      <q-btn flat round icon="fast_rewind" color="primary">
        <DelayedTooltip msg="Rewind" />
      </q-btn>
    </div>
    <!-- play button -->
    <div>
      <q-btn v-if="pStatus.player.status != 1" flat round icon="play_arrow" color="primary">
        <DelayedTooltip msg="Play" />
      </q-btn>
      <q-btn v-else-if="pStatus.player.status == 1" flat round icon="pause" color="primary">
        <DelayedTooltip msg="Pause" />
      </q-btn>
    </div>
    <!-- stop button -->
    <div>
      <q-btn flat round icon="stop" color="red-10">
        <DelayedTooltip msg="Stop" />
      </q-btn>
    </div>
    <!-- forward button -->
    <div>
      <q-btn flat round icon="fast_forward" color="primary">
        <DelayedTooltip msg="Forward" />
      </q-btn>
    </div>

    <!-- fullscreen button -->
    <div>
      <q-btn v-if="pStatus.fullscreen" flat round icon="fullscreen_exit" color="primary">
        <DelayedTooltip msg="Exit Fullscreen" />
      </q-btn>
      <q-btn v-else flat round icon="fullscreen" color="primary">
        <DelayedTooltip msg="Fullscreen" />
      </q-btn>
    </div>
  </div>
</template>

<style scoped></style>
