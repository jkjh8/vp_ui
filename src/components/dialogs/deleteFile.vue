<script setup>
import { useDialogPluginComponent } from 'quasar'
import BaseDialog from '../ui/BaseDialog.vue'

const props = defineProps({
  fileName: { type: String, required: true },
})

defineEmits(useDialogPluginComponent.emits)
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <BaseDialog :title="$t('dialogs.deleteFile.title')" icon="delete" danger>
      <div class="text-bold">{{ props.fileName }}</div>
      <div>{{ $t('dialogs.deleteFile.message') }}</div>
      <template #actions>
        <q-btn flat :label="$t('common.cancel')" @click="onDialogCancel" />
        <q-btn unelevated color="negative" :label="$t('common.delete')" @click="onDialogOK" />
      </template>
    </BaseDialog>
  </q-dialog>
</template>

<style scoped></style>
