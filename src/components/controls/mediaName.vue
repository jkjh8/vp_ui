<script setup>
//pinia
import { useStatusStore } from 'src/stores/useStatus.js'

const { pStatus } = useStatusStore()
</script>

<template>
  <div class="row no-wrap justify-center items-center q-mt-sm">
    <div class="text-bold">
      {{ pStatus.current.name ? pStatus.current.name : 'No media selected' }}
    </div>
  </div>
</template>

<style scoped></style>
