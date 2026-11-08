<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../DelayedTooltip.vue'
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
  if (
    props.audioDevice &&
    Array.isArray(props.audioDevices) &&
    props.audioDevices.some((d) => d.deviceId === props.audioDevice)
  ) {
    current.value = props.audioDevice
  } else {
    current.value = null
  }
})

const typeLabel = (type) => (type === 'asio' ? 'ASIO' : 'WASAPI')
const typeIcon = (type) => (type === 'asio' ? 'tune' : 'volume_up')

// ASIO를 우선 그룹으로, 그다음 WASAPI — 옵션 사이에 선택 불가능한 헤더 항목을 끼워넣음
const groupedOptions = computed(() => {
  const devices = props.audioDevices || []
  const result = []
  for (const type of ['asio', 'wasapi']) {
    const group = devices.filter((d) => d.type === type)
    if (!group.length) continue
    result.push({ header: true, label: typeLabel(type) })
    result.push(...group)
  }
  // type 필드가 없는 예전 프로토콜 장비 대비
  const untyped = devices.filter((d) => d.type !== 'asio' && d.type !== 'wasapi')
  if (untyped.length) result.push(...untyped)
  return result
})
</script>

<template>
  <q-dialog ref="dialogRef">
    <q-card>
      <q-card-section class="row items-center q-gutter-x-sm">
        <q-icon name="volume_up" size="2em" color="primary" />
        <div class="text-h6">{{ $t('dialogs.selectAudioDevice.title') }}</div>
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="current"
          :options="groupedOptions"
          option-value="deviceId"
          option-label="name"
          option-disable="header"
          emit-value
          map-options
          filled
          class="q-mb-md"
          :placeholder="$t('dialogs.selectAudioDevice.placeholder')"
          :clearable="true"
          :dense="true"
          :style="{ width: '100%' }"
        >
          <template #option="{ itemProps, opt, selected, toggleOption }">
            <q-item v-if="opt.header" class="text-caption text-grey-7">
              <q-item-section>{{ opt.label }}</q-item-section>
            </q-item>
            <q-item v-else v-bind="itemProps" clickable @click="toggleOption(opt)">
              <q-item-section avatar>
                <q-icon :name="typeIcon(opt.type)" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ opt.name }}</q-item-label>
                <q-item-label caption>
                  {{ typeLabel(opt.type) }}<span v-if="opt.channels"> · {{ opt.channels }}ch</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side v-if="selected">
                <q-icon name="check" color="primary" />
              </q-item-section>
            </q-item>
          </template>
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey-7"> {{ $t('dialogs.selectAudioDevice.noDevices') }} </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn round flat icon="cancel" color="negative" @click="onDialogCancel">
          <DelayedTooltip :msg="$t('common.cancel')" />
        </q-btn>
        <q-btn round flat icon="check_circle" color="primary" @click="onDialogOK(current)">
          <DelayedTooltip :msg="$t('common.select')" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: var(--radius-lg);
  width: 50%;
  max-width: 500px;
  min-width: 350px;
  background-color: var(--surface-1);
}
</style>
