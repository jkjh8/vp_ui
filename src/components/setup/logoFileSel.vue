<script setup>
import { useQuasar } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import selectLogo from '../dialogs/selectLogo.vue'
import DelayedTooltip from '../delayedTooltip.vue'
const { pStatus } = storeToRefs(useStatusStore())
const $q = useQuasar()

const openDialog = () => {
  $q.dialog({
    component: selectLogo,
    componentProps: {
      background: pStatus.value.background,
    },
    persistent: true,
  }).onOk((data) => {
    console.log(data)
    // pStatus.logo.file = data
    // useStatusStore().updateStatus('logo', pStatus.logo)
  })
}
</script>

<template>
  <div class="row justify-between items-center">
    <div>
      <q-icon name="public" size="sm" color="primary"></q-icon>
      <span class="q-ml-sm text-bold">Select Logo</span>
    </div>
    <!-- 컬러 선택 color picker -->
    <q-btn round flat color="primary" icon="colorize" @click="openDialog">
      <DelayedTooltip :msg="'Background Color: ' + pStatus.background" />
    </q-btn>
  </div>
</template>

<style scoped></style>
