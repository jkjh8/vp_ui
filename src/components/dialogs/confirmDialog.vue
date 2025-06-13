<script setup>
import { useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../delayedTooltip.vue'
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  title: {
    type: String,
    default: 'Confirm',
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?',
  },
})
</script>

<template>
  <q-dialog ref="dialogRef">
    <q-card>
      <q-card-section class="row items-center">
        <q-icon name="help" size="2em" color="primary" />
        <div class="text-h6 q-ml-md">{{ props.title }}</div>
      </q-card-section>
      <q-card-section>
        <div class="q-px-md">
          <div>{{ props.message }}</div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn round flat icon="cancel" color="grey" @click="onDialogCancel">
          <DelayedTooltip msg="Cancel" />
        </q-btn>
        <q-btn round flat icon="check_circle" color="primary" @click="onDialogOK">
          <DelayedTooltip msg="Confirm" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
}
</style>
