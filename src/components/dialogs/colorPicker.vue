<script setup>
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../DelayedTooltip.vue'
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  background: {
    type: String,
    required: true,
  },
})
const bg = ref(props.background)
</script>

<template>
  <q-dialog ref="dialogRef">
    <q-card>
      <q-card-section class="row items-center">
        <q-icon name="palette" size="2em" color="primary" />
        <div class="text-h6 q-ml-md">{{ $t('dialogs.colorPicker.title') }}</div>
      </q-card-section>
      <q-card-section>
        <q-color class="my-picker" v-model="bg" no-header-tabs flat />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn round flat icon="cancel" color="grey" @click="onDialogCancel">
          <DelayedTooltip :msg="$t('common.cancel')" />
        </q-btn>
        <q-btn round flat icon="check_circle" color="primary" @click="onDialogOK(bg)">
          <DelayedTooltip :msg="$t('common.confirm')" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: var(--radius-lg);
  background-color: var(--surface-1);
}
.my-picker {
  width: 300px;
}
</style>
