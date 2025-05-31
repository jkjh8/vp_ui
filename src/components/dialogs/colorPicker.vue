<script setup>
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../delayedTooltip.vue'
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
        <div class="text-h6 q-ml-md">Select Background Color</div>
      </q-card-section>
      <q-card-section>
        <q-color class="my-picker" v-model="bg" no-header-tabs flat />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn round flat icon="cancel" color="grey" @click="onDialogCancel">
          <DelayedTooltip msg="Cancel" />
        </q-btn>
        <q-btn round flat icon="check_circle" color="primary" @click="onDialogOK(bg)">
          <DelayedTooltip msg="Confirm" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.8); /* 배경색에 투명도 추가 (0.9 = 90% 불투명) */
}
.my-picker {
  width: 300px;
}
</style>
