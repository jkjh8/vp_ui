<script setup>
import { ref, onMounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../delayedTooltip.vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const editTime = ref(0)

const props = defineProps({
  time: {
    type: Number,
  },
})

onMounted(async () => {
  editTime.value = props.time || 0
})
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="dialog-card">
      <q-card-section class="row justify-between items-center">
        <div>
          <q-icon name="public" size="sm" color="primary"></q-icon>
          <span class="q-ml-sm text-bold">Rendering Time</span>
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model.number="editTime"
          filled
          dense
          type="number"
          label="Time in seconds"
          min="0"
          :rules="[(val) => val >= 0 || 'Time must be a positive number']"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat round icon="cancel" color="negative" @click="onDialogCancel">
          <DelayedTooltip msg="Cancel" />
        </q-btn>
        <q-btn flat round color="primary" icon="check_circle" @click="onDialogOK(editTime)">
          <DelayedTooltip msg="Confirm" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.dialog-card {
  max-width: 800px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1.5px solid #e0e0e0; /* 테두리 추가 */
}
</style>
