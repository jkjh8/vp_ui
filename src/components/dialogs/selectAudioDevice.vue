<script setup>
import { ref, onMounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../delayedTooltip.vue'
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  audioDevices: {
    type: Array,
    required: true,
  },
  audioDevice: {
    type: String,
  },
})

const current = ref(null)

onMounted(() => {
  current.value = props.audioDevice
})
</script>

<template>
  <q-dialog ref="dialogRef">
    <q-card>
      <q-card-section class="row items-center q-gutter-x-sm">
        <q-icon name="volume_up" size="2em" color="primary" />
        <div class="text-h6">Select Audio Device</div>
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="current"
          :options="props.audioDevices"
          option-value="deviceid"
          option-label="name"
          emit-value
          map-options
          filled
          class="q-mb-md"
          :placeholder="'Select an audio device'"
          :clearable="true"
          :dense="true"
          :style="{ width: '100%' }"
        ></q-select>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn round flat icon="cancel" color="negative" @click="onDialogCancel">
          <DelayedTooltip msg="Cancel" />
        </q-btn>
        <q-btn round flat icon="check_circle" color="primary" @click="onDialogOK(current)">
          <DelayedTooltip msg="Select" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: 1rem;
  width: 50%;
  max-width: 500px;
  min-width: 350px;
  background-color: rgba(255, 255, 255, 0.7); /* 배경색에 투명도 추가 (0.9 = 90% 불투명) */
}
</style>
