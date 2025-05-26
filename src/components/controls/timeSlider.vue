<script setup>
// pinia
import { useStatusStore } from 'src/stores/useStatus.js'
import { storeToRefs } from 'pinia'
// composables
import { msToHMS } from 'src/composables/useTime'

const { pStatus } = storeToRefs(useStatusStore())
</script>

<template>
  <div class="row no-wrap q-pt-none q-mt-none items-center">
    <q-slider
      class="q-mt-none q-pt-none"
      :model-value="pStatus.player.time / 1000"
      :min="0"
      :step="0.01"
      :max="pStatus.player.duration / 1000"
      label
      :label-value="msToHMS(pStatus.player.time / 1000)"
    />
    <div class="gt-xs text-caption q-px-sm">
      {{ msToHMS(pStatus.player.time / 1000) }}/{{ msToHMS(pStatus.player.duration / 1000) }}
    </div>
  </div>
</template>

<style scoped></style>
