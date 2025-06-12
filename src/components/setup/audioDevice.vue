<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import delayedTooltip from '../delayedTooltip.vue'
import selectAudioDevice from '../dialogs/selectAudioDevice.vue'

const $q = useQuasar()
const { pStatus } = storeToRefs(useStatusStore())

const openDialog = () => {
  $q.dialog({
    component: selectAudioDevice,
    componentProps: {
      audioDevices: pStatus.value.device.audiodevices,
      audioDevice: pStatus.value.device.audiodevice,
    },
  }).onOk(async (data) => {
    await useStatusStore().setAudioDevice(data)
  })
}

onMounted(() => {
  // Any initialization logic can go here
  // For example, you might want to fetch the audio devices if not already done
  useStatusStore().getAudioDevices()
})
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
