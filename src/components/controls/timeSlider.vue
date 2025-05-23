<script setup>
// pinia
import { useStatusStore } from 'src/stores/useStatus.js'
// composables
import { msToHMS } from 'src/composables/useTime'

const { pStatus } = useStatusStore()
</script>

<template>
  <div class="row no-wrap q-pt-none q-mt-none items-center">
    <q-slider
      class="q-mt-none q-pt-none"
      :model-value="pStatus.player.time"
      :min="0"
      :step="0.01"
      :max="pStatus.player.duration"
      label
      :label-value="msToHMS(pStatus.player.time)"
    />
    <div class="gt-xs text-caption q-px-sm">
      {{ msToHMS(pStatus.player.time) }}/{{ msToHMS(pStatus.player.duration) }}
    </div>
  </div>
</template>

<style scoped></style>
