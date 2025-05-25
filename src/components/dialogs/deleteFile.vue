<script setup>
import { useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../delayedTooltip.vue'
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  fileName: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <q-dialog ref="dialogRef">
    <q-card>
      <q-card-section class="row items-center">
        <q-icon name="delete" size="2em" color="negative" />
        <div class="text-h6 q-ml-md">Delete File</div>
      </q-card-section>
      <q-card-section>
        <div class="q-px-md">
          <div class="text-bold">{{ props.fileName }}</div>
          <div>Are you sure you want to delete this file?</div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn round flat icon="cancel" color="grey" @click="onDialogCancel">
          <DelayedTooltip msg="Cancel" />
        </q-btn>
        <q-btn round flat icon="check_circle" color="negative" @click="onDialogOK">
          <DelayedTooltip msg="Delete" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
