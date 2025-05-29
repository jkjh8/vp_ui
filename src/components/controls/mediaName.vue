<script setup>
//pinia
import { useStatusStore } from 'src/stores/useStatus.js'

const { pStatus } = useStatusStore()
</script>

<template>
  <div class="row no-wrap justify-center items-center q-mt-sm">
    <div v-if="pStatus.current && Object.keys(pStatus.current).length > 0" class="q-mr-md">
      <div class="text-bold">
        {{ pStatus.current.fieldname ? pStatus.current.fieldname : 'No media selected' }}
      </div>
    </div>
    <div v-else class="text-grey">No media selected</div>
  </div>
</template>

<style scoped></style>
