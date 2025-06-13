<script setup>
import { useQuasar } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import editNumber from '../dialogs/editNumber.vue'
import DelayedTooltip from '../delayedTooltip.vue'

const $q = useQuasar()
const { pStatus } = storeToRefs(useStatusStore())

const openDialogPort = async (type) => {
  let portKey, title, label, icon, currentValue
  if (type === 'web') {
    portKey = 'webPort'
    title = 'Set Web Port'
    label = 'Web Port'
    icon = 'public'
    currentValue = pStatus.value.webPort
  } else if (type === 'tcp') {
    portKey = 'tcpPort'
    title = 'Set TCP Port'
    label = 'TCP Port'
    icon = 'lan'
    currentValue = pStatus.value.tcpPort
  } else if (type === 'udp') {
    portKey = 'udpPort'
    title = 'Set UDP Port'
    label = 'UDP Port'
    icon = 'settings_input_antenna'
    currentValue = pStatus.value.udpPort
  } else {
    return
  }

  $q.dialog({
    component: editNumber,
    componentProps: {
      value: currentValue,
      title,
      label,
      icon,
      min: 0,
      max: 65535,
    },
  }).onOk(async (data) => {
    try {
      await useStatusStore().updateStatus(portKey, data)
      $q.notify({
        type: 'positive',
        message: `${label} updated successfully.`,
        caption: `New port: ${data} will take effect next time you restart the server.`,
      })
    } catch (error) {
      console.error(`Error updating ${label.toLowerCase()}:`, error)
    }
  })
}
</script>

<template>
  <div class="row justify-between items-center">
    <div>
      <q-icon name="web" size="sm" color="primary"></q-icon>
      <span class="q-ml-sm text-bold">Web Port</span>
      <span class="q-ml-sm text-caption">
        {{ pStatus.webPort }}
      </span>
    </div>
    <q-btn round flat color="primary" icon="edit" @click="openDialogPort('web')">
      <DelayedTooltip msg="Select Web Port" />
    </q-btn>
  </div>

  <div class="row justify-between items-center">
    <div>
      <q-icon name="web" size="sm" color="primary"></q-icon>
      <span class="q-ml-sm text-bold">TCP Port</span>
      <span class="q-ml-sm text-caption">
        {{ pStatus.tcpPort }}
      </span>
    </div>
    <q-btn round flat color="primary" icon="edit" @click="openDialogPort('tcp')">
      <DelayedTooltip msg="Select TCP Port" />
    </q-btn>
  </div>

  <div class="row justify-between items-center">
    <div>
      <q-icon name="web" size="sm" color="primary"></q-icon>
      <span class="q-ml-sm text-bold">UDP Port</span>
      <span class="q-ml-sm text-caption">
        {{ pStatus.udpPort }}
      </span>
    </div>
    <q-btn round flat color="primary" icon="edit" @click="openDialogPort('udp')">
      <DelayedTooltip msg="Select UDP Port" />
    </q-btn>
  </div>
</template>

<style scoped></style>
