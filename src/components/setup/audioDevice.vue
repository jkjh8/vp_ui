<script setup>
import { computed, onMounted } from 'vue'
import SettingRow from 'src/components/ui/SettingRow.vue'
import { useQuasar } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import DelayedTooltip from '../DelayedTooltip.vue'
import selectAudioDevice from '../dialogs/selectAudioDevice.vue'

const $q = useQuasar()
const { pStatus } = storeToRefs(useStatusStore())

const currentDevice = computed(() =>
  pStatus.value.audioDevices.find((d) => d.deviceId === pStatus.value.audioDevice),
)
const currentDeviceLabel = computed(() => {
  const d = currentDevice.value
  if (!d) return ''
  const type = d.type === 'asio' ? 'ASIO' : 'WASAPI'
  return d.channels ? `${d.name} (${type} · ${d.channels}ch)` : `${d.name} (${type})`
})

const openDialog = () => {
  $q.dialog({
    component: selectAudioDevice,
    componentProps: {
      audioDevices: pStatus.value.audioDevices,
      audioDevice: pStatus.value.audioDevice,
    },
  }).onOk(async (deviceId) => {
    await useStatusStore().setAudioDevice(deviceId)
  })
}

onMounted(() => {
  useStatusStore().getAudioDevices()
})
</script>

<template>
  <SettingRow icon="volume_up" :label="$t('setup.audioDevice.title')" :caption="currentDeviceLabel">
    <template #control>
      <q-btn color="primary" icon="edit" round flat @click="openDialog">
        <DelayedTooltip :msg="$t('setup.audioDevice.selectTooltip')" />
      </q-btn>
    </template>
  </SettingRow>
</template>

<style scoped></style>
