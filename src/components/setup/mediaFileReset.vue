<script setup>
import SettingRow from 'src/components/ui/SettingRow.vue'
import { useQuasar } from 'quasar'
import { useApiStore } from 'src/stores/useApi'
import confirmDialog from '../dialogs/confirmDialog.vue'
import DelayedTooltip from '../DelayedTooltip.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const $q = useQuasar()
const { apiCallWithLoading } = useApiStore()

const onMediaReset = () => {
  $q.dialog({
    component: confirmDialog,
    componentProps: {
      title: t('setup.mediaFileReset.confirmTitle'),
      message: t('setup.mediaFileReset.confirmMessage'),
      danger: true,
    },
  }).onOk(async () => {
    try {
      await apiCallWithLoading('/files/reset_all', 'GET', {}, t('setup.mediaFileReset.resetting'))
      $q.notify({ type: 'positive', message: t('setup.mediaFileReset.resetSuccess') })
    } catch (error) {
      console.error('Media reset error:', error)
      $q.notify({ type: 'negative', message: t('setup.mediaFileReset.resetError') })
    }
  })
}
</script>

<template>
  <SettingRow icon="delete_forever" :label="$t('setup.mediaFileReset.title')">
    <template #control>
      <q-btn round flat color="negative" icon="delete" @click="onMediaReset">
        <DelayedTooltip :msg="$t('setup.mediaFileReset.tooltip')" />
      </q-btn>
    </template>
  </SettingRow>
</template>

<style scoped></style>
