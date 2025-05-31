<script setup>
import { useQuasar } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import delayedTooltip from '../delayedTooltip.vue'
import selectAudioDevice from '../dialogs/selectAudioDevice.vue'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const openDialog = () => {
  $q.dialog({
    component: selectAudioDevice,
    componentProps: {
      audioDevices: pStatus.value.device.audiodevices,
      audioDevice: pStatus.value.device.audiodevice,
    },
  }).onOk(async (data) => {
    try {
      const r = await api.put('/player/setaudiodevice', {
        deviceId: data,
      })
      console.log(r)
      pStatus.value.device.audiodevice = data
    } catch (error) {
      console.error('Error occurred while setting audio device:', error)
    }
  })
}

const { pStatus } = storeToRefs(useStatusStore())
</script>

<template>
  <div class="row justify-between items-center">
    <div>
      <q-icon name="volume_up " size="sm" color="primary"></q-icon>
      <span class="q-ml-sm text-bold">Audio Output Device</span>
      <span class="text-caption q-ml-sm">
        {{
          pStatus.device.audiodevices.find((d) => d.deviceid === pStatus.device.audiodevice)
            ?.name || ''
        }}
      </span>
    </div>
    <q-btn color="primary" icon="edit" round flat @click="openDialog">
      <delayed-tooltip msg="Select Audio Device" />
    </q-btn>
  </div>
</template>

<style scoped></style>
