<script setup>
// 라이브 입력 소스(RTP/RTSP/SRT) 추가/편집 다이얼로그. addPlaylist 패턴(useDialogPluginComponent).
import { ref, computed, onMounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useStatusStore } from 'src/stores/useStatus'
import DelayedTooltip from '../DelayedTooltip.vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const { t } = useI18n()
const { pStatus } = storeToRefs(useStatusStore())

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
})

// NDI는 플레이어에 런타임이 설치된 경우(live_ndi capability)에만 선택 가능.
const ndiAvailable = computed(() => (pStatus.value.playerFeatures || []).includes('live_ndi'))
const kindOptions = computed(() => {
  const opts = [
    { label: t('sources.kinds.rtsp'), value: 'rtsp' },
    { label: t('sources.kinds.srt'), value: 'srt' },
    { label: t('sources.kinds.rtp'), value: 'rtp' },
    { label: t('sources.kinds.udp'), value: 'udp' },
  ]
  if (ndiAvailable.value) opts.push({ label: t('sources.kinds.ndi'), value: 'ndi' })
  return opts
})
// AUTO = 페이로드 타입으로 depay+코덱 자동 감지(권장). MP2T = MPEG-TS over RTP(VLC 기본, payload 보통 33).
const encodingOptions = ['AUTO', 'H264', 'H265', 'VP8', 'VP9', 'JPEG', 'MP2T']

const form = ref({
  name: '',
  kind: 'rtsp',
  uri: '',
  rtp: { address: '', port: 5004, encoding_name: 'AUTO', payload: 96, clock_rate: 90000, media: 'video' },
  ndi_name: '',
  url_address: '',
  latency_ms: 200,
  has_audio: false,
})

onMounted(() => {
  if (props.initialData?.id) {
    form.value = {
      ...form.value,
      ...props.initialData,
      rtp: { ...form.value.rtp, ...(props.initialData.rtp || {}) },
    }
  }
})

const isRtp = computed(() => form.value.kind === 'rtp')
// rtp/udp 공통: 주소(멀티캐스트 옵션)+포트. rtp만 코덱/페이로드가 추가로 의미 있음.
const isNetKind = computed(() => form.value.kind === 'rtp' || form.value.kind === 'udp')
// AUTO 코덱이면 payload/clock-rate는 불필요(스트림에서 자동 판별)라 감춘다.
const showRtpCodecDetails = computed(() => isRtp.value && form.value.rtp.encoding_name !== 'AUTO')
const isNdi = computed(() => form.value.kind === 'ndi')
const isUriKind = computed(() => form.value.kind === 'rtsp' || form.value.kind === 'srt')
const isValid = computed(() => {
  if (!form.value.name.trim()) return false
  if (isUriKind.value) return form.value.uri.trim().length > 0
  if (isNetKind.value) return Number(form.value.rtp.port) > 0
  if (isNdi.value) return form.value.ndi_name.trim().length > 0 || form.value.url_address.trim().length > 0
  return true
})

const submit = () => {
  if (!isValid.value) return
  onDialogOK(JSON.parse(JSON.stringify(form.value)))
}
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card style="min-width: 440px">
      <q-card-section class="row items-center">
        <q-icon name="sensors" size="2em" color="primary" />
        <div class="text-h6 q-ml-md">
          {{ props.initialData?.id ? $t('sources.edit') : $t('sources.add') }}
        </div>
      </q-card-section>
      <q-form @submit.prevent="submit">
        <q-separator />
        <q-card-section class="q-gutter-y-md">
          <q-input
            v-model="form.name"
            :label="$t('sources.fields.name')"
            filled
            dense
            autofocus
            :error="!form.name.trim()"
          />
          <q-select
            v-model="form.kind"
            :options="kindOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            filled
            dense
            :label="$t('sources.fields.kind')"
          />

          <!-- RTSP / SRT: URL -->
          <q-input
            v-if="isUriKind"
            v-model="form.uri"
            :label="$t('sources.fields.uri')"
            filled
            dense
            :error="isUriKind && !form.uri.trim()"
          />

          <!-- NDI: 송출기 이름 또는 주소 -->
          <template v-if="isNdi">
            <q-input v-model="form.ndi_name" :label="$t('sources.fields.ndiName')" filled dense />
            <q-input v-model="form.url_address" :label="$t('sources.fields.urlAddress')" filled dense />
          </template>

          <!-- RTP/UDP: 주소(멀티캐스트 옵션)+포트. RTP는 코덱 선택(기본 AUTO=자동 감지) 추가. -->
          <template v-if="isNetKind">
            <q-input v-model="form.rtp.address" :label="$t('sources.fields.address')" filled dense />
            <q-input v-model.number="form.rtp.port" :label="$t('sources.fields.port')" type="number" filled dense />
            <q-select
              v-if="isRtp"
              v-model="form.rtp.encoding_name"
              :options="encodingOptions"
              :label="$t('sources.fields.encoding')"
              filled
              dense
            />
            <template v-if="showRtpCodecDetails">
              <q-input v-model.number="form.rtp.payload" :label="$t('sources.fields.payload')" type="number" filled dense />
              <q-input v-model.number="form.rtp.clock_rate" :label="$t('sources.fields.clockRate')" type="number" filled dense />
            </template>
          </template>

          <q-input
            v-model.number="form.latency_ms"
            :label="$t('sources.fields.latency')"
            type="number"
            filled
            dense
          />
          <q-toggle v-model="form.has_audio" :label="$t('sources.fields.hasAudio')" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn round flat dense icon="cancel" color="grey" @click="onDialogCancel">
            <DelayedTooltip :msg="$t('common.cancel')" />
          </q-btn>
          <q-btn round flat dense icon="check_circle" color="primary" type="submit" :disable="!isValid">
            <DelayedTooltip :msg="$t('common.ok')" />
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: var(--radius-lg);
  background-color: var(--surface-1);
}
</style>
