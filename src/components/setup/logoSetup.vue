<script setup>
import { useQuasar } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import selectLogo from '../dialogs/selectLogo.vue'
import logoSize from '../dialogs/logoSize.vue'
import DelayedTooltip from '../delayedTooltip.vue'
import { api } from 'src/boot/axios.js'
const { pStatus } = storeToRefs(useStatusStore())
const $q = useQuasar()

const openDialog = () => {
  $q.dialog({
    component: selectLogo,
    componentProps: {
      logo: pStatus.value.logo.name,
    },
    persistent: true,
  }).onOk(async (data) => {
    try {
      const r = await api.get('/status/logo/sel/' + encodeURIComponent(data))
      pStatus.logo = r.data.pStatus.logo
      useStatusStore().updateStatus('logo', pStatus.logo)
    } catch (error) {
      console.error('Error selecting logo:', error)
    }
  })
}

const openDialogSize = () => {
  $q.dialog({
    component: logoSize,
    componentProps: {
      width: pStatus.value.logo.width,
      height: pStatus.value.logo.height,
    },
    persistent: true,
  }).onOk(async (data) => {
    try {
      const r = await api.put('/status/logo/size', {
        width: data.width,
        height: data.height,
      })
      pStatus.logo = r.data.pStatus.logo
      useStatusStore().updateStatus('logo', pStatus.logo)
    } catch (error) {
      console.error('Error updating logo size:', error)
    }
  })
}

const updateLogoShow = async (value) => {
  try {
    const r = await api.get('/status/logo/show/' + (value ? 'true' : 'false'))
    console.log(r)
    pStatus.logo = r.data.pStatus.logo
  } catch (error) {
    console.error('Error updating logo visibility:', error)
  }
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
          {{ pStatus.logo.width }} x {{ pStatus.logo.height }}
        </span>
      </div>
      <q-btn round flat color="primary" icon="edit" @click="openDialogSize">
        <DelayedTooltip msg="Select Logo" />
      </q-btn>
    </div>
  </div>
</template>

<style scoped></style>
