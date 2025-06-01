<script setup>
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'

const { updateImageTime } = useStatusStore()
const { pStatus } = storeToRefs(useStatusStore())
const updateValue = async (value) => {
  await updateImageTime(value)
}
</script>

<template>
  <div class="row justify-between items-center">
    <div>
      <q-icon name="timer " size="sm" color="primary"></q-icon>
      <span class="q-ml-sm text-bold">Image Showing Time</span>
    </div>
    <div class="row items-center">
      <q-btn
        flat
        round
        icon="chevron_left"
        @click="updateValue(Math.max(0, (pStatus.image_time || 0) - 1))"
        size="sm"
      />
      <span class="q-mx-md text-bold" style="min-width: 40px; text-align: center">
        {{ pStatus.image_time }}<span class="text-caption q-ml-xs">sec</span>
      </span>
      <q-btn
        flat
        round
        icon="chevron_right"
        @click="updateValue(Math.min(3600, (pStatus.image_time || 0) + 1))"
        size="sm"
      />
    </div>
  </div>
</template>

<style scoped></style>
