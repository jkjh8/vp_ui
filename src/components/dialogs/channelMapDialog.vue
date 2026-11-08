<script setup>
// 채널 라우팅 편집 다이얼로그 (플레이리스트 항목 / 오디오 레인 / 타임라인 트랙 공용)
//
// channel_map 규약 (PROTOCOL.md §5.1): 인덱스 = 소스 채널, 값 = 출력 디바이스 채널
// 인덱스, -1 = 뮤트, null = 기본 라우팅(스테레오 다운믹스 → 0,1).
// 출력 채널수는 현재 설정된 오디오 디바이스의 채널수를 따른다.
import { ref, computed, onMounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import DelayedTooltip from '../DelayedTooltip.vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const { t } = useI18n()
const { pStatus } = storeToRefs(useStatusStore())

const props = defineProps({
  // 하이드레이션된 트랙/파일 객체 (metadata.streams에서 소스 채널수 추출)
  file: { type: Object, required: true },
  channelMap: { type: Array, default: null },
  volume: { type: Number, default: 100 },
  showVolume: { type: Boolean, default: true },
})

// 소스 오디오 채널수: 첫 오디오 스트림의 channels (metaData.vue와 동일 파싱), 폴백 2
const sourceChannels = computed(() => {
  const streams = props.file?.metadata?.streams || []
  const audio = streams.find((s) => s.codec_type === 'audio')
  return audio?.channels > 0 ? audio.channels : 2
})

// 출력 채널수: 현재 오디오 디바이스의 채널수, 폴백 2
const currentDevice = computed(() =>
  (pStatus.value.audioDevices || []).find((d) => d.deviceId === pStatus.value.audioDevice),
)
const outputChannels = computed(() => currentDevice.value?.channels ?? 2)

const useCustom = ref(false) // false = 기본 라우팅 (channel_map: null)
const mapping = ref([]) // mapping[src] = 출력 채널 인덱스 | -1(뮤트)
const editVolume = ref(100)

// 출력 채널 선택 옵션: 뮤트 + 0..N-1 (표기는 1-based "Ch 1"이 현장 관례)
const outputOptions = computed(() => [
  { label: t('dialogs.channelMapDialog.mute'), value: -1 },
  ...Array.from({ length: outputChannels.value }, (_, i) => ({
    label: t('dialogs.channelMapDialog.channelLabel', { n: i + 1 }),
    value: i,
  })),
])

// 저장된 맵이 현재 디바이스 폭을 넘는 항목을 가지면 경고 (플레이어는 해당 채널 뮤트)
const hasOutOfRange = computed(
  () => useCustom.value && mapping.value.some((v) => v >= outputChannels.value),
)

onMounted(() => {
  editVolume.value = props.volume ?? 100
  if (Array.isArray(props.channelMap) && props.channelMap.length > 0) {
    useCustom.value = true
    mapping.value = Array.from(
      { length: sourceChannels.value },
      (_, i) => props.channelMap[i] ?? -1,
    )
  } else {
    // 기본 = 항등 배치로 초기화 (커스텀 켜는 순간의 시작값)
    mapping.value = Array.from({ length: sourceChannels.value }, (_, i) =>
      i < outputChannels.value ? i : -1,
    )
  }
})

const confirm = () => {
  onDialogOK({
    channel_map: useCustom.value ? [...mapping.value] : null,
    volume: editVolume.value,
  })
}
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="dialog-card">
      <q-card-section class="row justify-between items-center">
        <div>
          <q-icon name="settings_input_component" size="sm" color="primary"></q-icon>
          <span class="q-ml-sm text-bold">{{ $t('dialogs.channelMapDialog.title') }}</span>
        </div>
        <div class="text-caption text-grey-7">
          {{
            $t('dialogs.channelMapDialog.routingSummary', {
              filename: file.filename,
              src: sourceChannels,
              device: currentDevice?.name || $t('dialogs.channelMapDialog.defaultDevice'),
              out: outputChannels,
            })
          }}
        </div>
      </q-card-section>

      <q-card-section v-if="showVolume" class="q-pt-none">
        <div class="row items-center q-gutter-md">
          <q-icon name="volume_up" color="primary" />
          <q-slider
            v-model="editVolume"
            :min="0"
            :max="100"
            label
            class="col"
            color="primary"
          />
          <span class="text-caption" style="width: 2.5rem">{{ editVolume }}</span>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-toggle
          v-model="useCustom"
          :label="$t('dialogs.channelMapDialog.useCustom')"
          color="primary"
          dense
        />
        <div v-if="!useCustom" class="text-caption text-grey-7 q-mt-sm">
          {{ $t('dialogs.channelMapDialog.defaultRoutingDesc') }}
        </div>
        <div v-else class="q-mt-sm">
          <div
            v-for="src in sourceChannels"
            :key="src"
            class="row items-center q-gutter-sm q-mb-xs"
          >
            <span class="text-caption" style="width: 5.5rem">{{
              $t('dialogs.channelMapDialog.sourceChannel', { n: src })
            }}</span>
            <q-select
              v-model="mapping[src - 1]"
              :options="outputOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              dense
              filled
              class="col"
            />
          </div>
          <q-banner v-if="hasOutOfRange" dense rounded class="bg-orange-2 text-orange-9 q-mt-sm">
            {{ $t('dialogs.channelMapDialog.outOfRangeWarning', { ch: outputChannels }) }}
          </q-banner>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat round icon="cancel" color="negative" @click="onDialogCancel">
          <DelayedTooltip :msg="$t('common.cancel')" />
        </q-btn>
        <q-btn flat round color="primary" icon="check_circle" @click="confirm">
          <DelayedTooltip :msg="$t('common.confirm')" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.dialog-card {
  max-width: 800px;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background-color: var(--surface-1);
  border: 1px solid var(--border);
}
</style>
