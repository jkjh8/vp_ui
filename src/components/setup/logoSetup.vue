<script setup>
import { useQuasar } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import selectLogo from '../dialogs/selectLogo.vue'
import logoSize from '../dialogs/editNumber.vue'
import DelayedTooltip from '../delayedTooltip.vue'
const { updateLogo, updateLogoSize, updateLogoVisibility } = useStatusStore()

const $q = useQuasar()
const { pStatus } = storeToRefs(useStatusStore())

const openDialog = () => {
  $q.dialog({
    component: selectLogo,
    componentProps: {
      logo: pStatus.value.logo.name,
    },
    persistent: true,
  }).onOk((data) => {
    updateLogo(data)
  })
}

const openDialogSize = () => {
  $q.dialog({
    component: logoSize,
    componentProps: {
      value: pStatus.value.logo.size,
      title: 'Set Logo Size',
      label: 'Logo Size',
      icon: 'square_foot',
      unit: 'px',
      min: 0,
      max: 300,
    },
    persistent: true,
  }).onOk((data) => {
    updateLogoSize(data)
  })
}

const updateLogoShow = (value) => {
  updateLogoVisibility(value)
}
</script>

<template>
  <div class="row justify-between items-center">
    <div>
      <q-icon name="visibility" size="sm" color="primary"></q-icon>
      <span class="q-ml-sm text-bold">Logo Show</span>
    </div>
    <q-toggle v-model="pStatus.logo.show" color="primary" @update:model-value="updateLogoShow" />
  </div>
  <div v-if="pStatus.logo.show">
    <div class="row justify-between items-center">
      <div>
        <q-icon name="public" size="sm" color="primary"></q-icon>
        <span class="q-ml-sm text-bold">Select Logo</span>
        <span class="q-ml-sm text-caption">
          {{ pStatus.logo.name || 'No logo selected' }}
        </span>
      </div>
      <q-btn round flat color="primary" icon="edit" @click="openDialog">
        <DelayedTooltip msg="Select Logo" />
      </q-btn>
    </div>

    <div class="row justify-between items-center">
      <div>
        <q-icon name="square_foot" size="sm" color="primary"></q-icon>
        <span class="q-ml-sm text-bold">Logo Size</span>
        <span class="q-ml-sm text-caption">
          {{ pStatus.logo.size }}
        </span>
      </div>
      <q-btn round flat color="primary" icon="edit" @click="openDialogSize">
        <DelayedTooltip msg="Select Logo" />
      </q-btn>
    </div>
  </div>
</template>

<style scoped></style>
