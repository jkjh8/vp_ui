<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../delayedTooltip.vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  title: {
    type: String,
    default: 'Number',
  },
  label: {
    type: String,
    default: 'Value',
  },
  icon: {
    type: String,
    default: 'edit',
  },
  value: {
    type: Number,
    default: 0,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: Infinity,
  },
  unit: {
    type: String,
    default: '',
  },
  rules: {
    type: Array,
    default: () => [(val) => val >= 0 || 'at least 0 required'],
  },
})

const editValue = ref(props.value)

onMounted(() => {
  editValue.value = props.value
})

const displayLabel = computed(() => (props.unit ? `${props.label} (${props.unit})` : props.label))
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="dialog-card">
      <q-card-section class="row justify-between items-center">
        <div>
          <q-icon name="pin" size="sm" color="primary"></q-icon>
          <span class="q-ml-sm text-bold">{{ props.title }}</span>
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model.number="editValue"
          filled
          dense
          type="number"
          :label="displayLabel"
          :min="props.min"
          :max="props.max !== Infinity ? props.max : undefined"
          :rules="props.rules"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat round icon="cancel" color="negative" @click="onDialogCancel">
          <DelayedTooltip msg="취소" />
        </q-btn>
        <q-btn flat round color="primary" icon="check_circle" @click="onDialogOK(editValue)">
          <DelayedTooltip msg="확인" />
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
  border: 1.5px solid #e0e0e0;
}
</style>
