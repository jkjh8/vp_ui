<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useI18n } from 'vue-i18n'
import DelayedTooltip from '../DelayedTooltip.vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const { t } = useI18n()

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

const displayLabel = computed(() => {
  const label = props.label || t('dialogs.editNumber.labelDefault')
  return props.unit ? `${label} (${props.unit})` : label
})
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="dialog-card">
      <q-card-section class="row justify-between items-center">
        <div>
          <q-icon name="pin" size="sm" color="primary"></q-icon>
          <span class="q-ml-sm text-bold">{{ props.title || $t('dialogs.editNumber.titleDefault') }}</span>
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
          <DelayedTooltip :msg="$t('common.cancel')" />
        </q-btn>
        <q-btn flat round color="primary" icon="check_circle" @click="onDialogOK(editValue)">
          <DelayedTooltip :msg="$t('common.confirm')" />
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
  border-radius: var(--radius-lg);
  background-color: var(--surface-1);
  border: 1px solid var(--border);
}
</style>
