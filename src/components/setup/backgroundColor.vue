<script setup>
import SettingRow from 'src/components/ui/SettingRow.vue'
import { useQuasar } from 'quasar'
import { useApiStore } from 'src/stores/useApi'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import colorPicker from '../dialogs/colorPicker.vue'
import DelayedTooltip from '../DelayedTooltip.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const { isBright } = useStatusStore()
const { apiCallWithLoading } = useApiStore()

const { pStatus } = storeToRefs(useStatusStore())
const $q = useQuasar()

const openDialog = () => {
  $q.dialog({
    component: colorPicker,
    componentProps: { background: pStatus.value.backgroundColor },
  }).onOk(async (color) => {
    try {
      if (color.startsWith('rgb')) {
        const rgb = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        if (rgb) {
          const r = parseInt(rgb[1]).toString(16).padStart(2, '0')
          const g = parseInt(rgb[2]).toString(16).padStart(2, '0')
          const b = parseInt(rgb[3]).toString(16).padStart(2, '0')
          color = `#${r}${g}${b}`
        }
      }
      await apiCallWithLoading(
        '/player/background',
        'POST',
        { color },
        t('setup.backgroundColor.updating', { color }),
      )
      pStatus.value.backgroundColor = color
      $q.notify({ type: 'positive', message: t('setup.backgroundColor.updated', { color }) })
    } catch (error) {
      console.error('Error occurred while converting color:', error)
    }
  })
}
</script>

<template>
  <SettingRow icon="palette" :label="$t('setup.backgroundColor.title')">
    <template #control>
      <q-chip
        dense
        class="q-pa-sm color-chip"
        :style="{ backgroundColor: pStatus.backgroundColor }"
        :text-color="isBright(pStatus.backgroundColor) ? 'black' : 'white'"
        :label="pStatus.backgroundColor"
      />
      <q-btn round flat color="primary" icon="colorize" @click="openDialog">
        <DelayedTooltip :msg="$t('setup.backgroundColor.tooltip', { color: pStatus.backgroundColor })" />
      </q-btn>
    </template>
  </SettingRow>
</template>

<style scoped>
.color-chip {
  font-size: 0.6rem;
}
</style>
