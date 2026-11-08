<script setup>
import { useDialogPluginComponent } from 'quasar'
import BaseDialog from '../ui/BaseDialog.vue'

const props = defineProps({
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  danger: { type: Boolean, default: false },
})

defineEmits(useDialogPluginComponent.emits)
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <BaseDialog
      :title="props.title || $t('dialogs.confirm.titleDefault')"
      :icon="danger ? 'warning' : 'help'"
      :danger="danger"
    >
      <div>{{ props.message || $t('dialogs.confirm.messageDefault') }}</div>
      <template #actions>
        <q-btn flat :label="$t('common.cancel')" @click="onDialogCancel" />
        <q-btn
          unelevated
          :color="danger ? 'negative' : 'primary'"
          :label="$t('common.confirm')"
          @click="onDialogOK"
        />
      </template>
    </BaseDialog>
  </q-dialog>
</template>

<style scoped></style>
