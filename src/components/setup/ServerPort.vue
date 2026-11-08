<script setup>
import SettingRow from 'src/components/ui/SettingRow.vue'
import { useQuasar } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import editNumber from '../dialogs/editNumber.vue'
import DelayedTooltip from '../DelayedTooltip.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const $q = useQuasar()
const { pStatus } = storeToRefs(useStatusStore())

const openDialogPort = async (type) => {
  let portKey, title, label, icon, currentValue
  if (type === 'web') {
    portKey = 'webPort'
    title = t('setup.severPort.setWebPort')
    label = t('setup.severPort.webPort')
    icon = 'public'
    currentValue = pStatus.value.webPort
  } else if (type === 'tcp') {
    portKey = 'tcpSimplePort'
    title = t('setup.severPort.setTcpPort')
    label = t('setup.severPort.tcpPort')
    icon = 'lan'
    currentValue = pStatus.value.tcpSimplePort
  } else {
    return
  }

  $q.dialog({
    component: editNumber,
    componentProps: { value: currentValue, title, label, icon, min: 1, max: 65535 },
  }).onOk(async (data) => {
    try {
      await useStatusStore().updateStatus(portKey, data)
      $q.notify({
        type: 'positive',
        message: t('setup.severPort.updated', { label }),
        caption: t('setup.severPort.updatedCaption', { port: data }),
      })
    } catch (error) {
      console.error(`Error updating ${label.toLowerCase()}:`, error)
    }
  })
}
</script>

<template>
  <SettingRow icon="public" :label="$t('setup.severPort.webPort')" :caption="`${pStatus.webPort}`">
    <template #control>
      <q-btn round flat color="primary" icon="edit" @click="openDialogPort('web')">
        <DelayedTooltip :msg="$t('setup.severPort.selectWebTooltip')" />
      </q-btn>
    </template>
  </SettingRow>

  <SettingRow icon="lan" :label="$t('setup.severPort.tcpPort')" :caption="`${pStatus.tcpSimplePort}`">
    <template #control>
      <q-btn round flat color="primary" icon="edit" @click="openDialogPort('tcp')">
        <DelayedTooltip :msg="$t('setup.severPort.selectTcpTooltip')" />
      </q-btn>
    </template>
  </SettingRow>
</template>

<style scoped></style>
