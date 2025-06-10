<script setup>
import { ref, onMounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../delayedTooltip.vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const editSize = ref(0)

const props = defineProps({
  size: {
    type: Number,
  },
})

onMounted(async () => {
  editSize.value = props.size || 0
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
          v-model.number="editSize"
          filled
          dense
          type="number"
          label="Time in seconds"
          min="0"
          :rules="[(val) => val >= 0 || 'Size must be a positive number']"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat round icon="cancel" color="negative" @click="onDialogCancel">
          <DelayedTooltip msg="Cancel the selection" />
        </q-btn>
        <q-btn flat round color="primary" icon="check_circle" @click="onDialogOK(editSize)">
          <DelayedTooltip msg="Select the first logo file" />
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
