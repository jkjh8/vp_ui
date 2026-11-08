<script setup>
// 범용 "목록에서 하나 선택 → 확인/취소" 다이얼로그.
// 사용: $q.dialog({ component: ListPickerDialog, componentProps: { title, options, optionLabel, optionValue, modelValue } })
//       .onOk((value) => …)
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import BaseDialog from './BaseDialog.vue'

const props = defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: 'list' },
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, default: 'label' },
  optionValue: { type: String, default: 'value' },
  optionCaption: { type: String, default: '' },
  modelValue: { default: null },
})

defineEmits(useDialogPluginComponent.emits)
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const sel = ref(props.modelValue)
const labelOf = (o) => (o && typeof o === 'object' ? o[props.optionLabel] : o)
const valueOf = (o) => (o && typeof o === 'object' ? o[props.optionValue] : o)
const captionOf = (o) =>
  props.optionCaption && o && typeof o === 'object' ? o[props.optionCaption] : ''
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <BaseDialog :title="title" :icon="icon">
      <q-list>
        <q-item
          v-for="(o, i) in options"
          :key="i"
          clickable
          :active="valueOf(o) === sel"
          active-class="list-row--active"
          class="list-row q-mb-xs"
          @click="sel = valueOf(o)"
        >
          <q-item-section>
            <q-item-label>{{ labelOf(o) }}</q-item-label>
            <q-item-label v-if="captionOf(o)" caption>{{ captionOf(o) }}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="valueOf(o) === sel">
            <q-icon name="check" color="primary" />
          </q-item-section>
        </q-item>
      </q-list>
      <template #actions>
        <q-btn flat :label="$t('common.cancel')" @click="onDialogCancel" />
        <q-btn
          unelevated
          color="primary"
          :label="$t('common.confirm')"
          :disable="sel == null"
          @click="onDialogOK(sel)"
        />
      </template>
    </BaseDialog>
  </q-dialog>
</template>

<style scoped></style>
