<script setup>
import { ref, computed } from 'vue'
// pinia
import { useStatusStore } from 'src/stores/useStatus.js'
import { storeToRefs } from 'pinia'
// composables
import { msToHMS } from 'src/composables/useTime'
import { fnUpdateTime } from 'src/composables/usePlayer'

const { pStatus } = storeToRefs(useStatusStore())

const slideTime = ref(0)
const start = ref(false)

const props = defineProps({
  time: {
    type: Boolean,
    default: true,
  },
})

const isImage = computed(() => pStatus.value.current?.is_image)

const updateTimeFromSlide = (t) => {
  slideTime.value = t
  // panning이 시작된 적이 없을 때(즉, 클릭만 한 경우)에만 호출
  if (!start.value && !isImage.value) {
    fnUpdateTime(slideTime.value)
  }
}

const panning = (e) => {
  try {
    if (isImage.value) return
    if (e === 'start') {
      start.value = true
    } else if (e === 'end') {
      start.value = false
      fnUpdateTime(slideTime.value)
    }
  } catch (error) {
    console.error('Error during panning:', error)
  }
}
</script>

<template>
  <div class="row no-wrap q-pt-none q-mt-none q-px-md q-gutter-x-sm items-center">
    <q-slider
      class="q-mt-none q-pt-none"
      :model-value="pStatus.player.time / 1000"
      :min="0"
      :step="0.01"
      :max="pStatus.player.duration / 1000"
      label
      :label-value="msToHMS(pStatus.player.time / 1000)"
      @update:model-value="updateTimeFromSlide"
      @pan="panning"
      :disable="isImage"
    />
    <div v-if="props.time" class="gt-xs text-caption">
      {{ msToHMS(pStatus.player.time / 1000) }}/{{ msToHMS(pStatus.player.duration / 1000) }}
    </div>
  </div>
</template>

<style scoped></style>
