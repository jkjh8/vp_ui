<script setup>
import { computed } from 'vue'
//pinia
import { useStatusStore } from 'src/stores/useStatus.js'
const file = computed(() => {
  return useStatusStore().pStatus.player[pStatus.activePlayerId]?.file || {}
})

const { pStatus } = useStatusStore()
</script>

<template>
  <div class="row no-wrap justify-center items-center q-mt-sm">
    <div v-if="file" class="row items-center q-gutter-x-sm">
      <q-icon :name="file.is_image ? 'image' : 'video_library'" size="sm" color="primary"></q-icon>
      <span class="text-bold">
        {{ file.fieldname ? file.fieldname : 'No media selected' }}
      </span>
    </div>
    <div v-else class="text-grey">No media selected</div>
  </div>
</template>

<style scoped></style>
