<script setup>
import { useQuasar } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import colorPicker from '../dialogs/colorPicker.vue'
import DelayedTooltip from '../delayedTooltip.vue'
const { updateBackgroundColor, isBright } = useStatusStore()
const { pStatus } = storeToRefs(useStatusStore())
const $q = useQuasar()

const openDialog = () => {
  $q.dialog({
    component: colorPicker,
    componentProps: {
      background: pStatus.value.background,
    },
    persistent: true,
  }).onOk((data) => {
    // rgb에서 hex로 변환
    if (data.startsWith('rgb')) {
      const rgb = data.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (rgb) {
        const r = parseInt(rgb[1]).toString(16).padStart(2, '0')
        const g = parseInt(rgb[2]).toString(16).padStart(2, '0')
        const b = parseInt(rgb[3]).toString(16).padStart(2, '0')
        data = `#${r}${g}${b}`
      }
    }
    updateBackgroundColor(data)
  })
}
</script>

<template>
  <div class="row justify-between items-center">
    <div>
      <q-icon name="palette" size="sm" color="primary"></q-icon>
      <span class="q-ml-sm text-bold">Background Color</span>
      <!-- 현재 색상 표시 -->
      <q-chip
        dense
        class="q-ml-sm q-pa-sm"
        :style="{
          backgroundColor: pStatus.background,
          fontSize: '0.6rem',
        }"
        :text-color="isBright(pStatus.background) ? 'black' : 'white'"
        :label="pStatus.background"
      >
      </q-chip>
    </div>
    <!-- 컬러 선택 color picker -->
    <q-btn round flat color="primary" icon="colorize" @click="openDialog">
      <DelayedTooltip :msg="'Background Color: ' + pStatus.background" />
    </q-btn>
  </div>
</template>

<style scoped></style>
