<script setup>
// 멀티 윈도우 출력 창 관리 패널.
// 사용자 정의 창 목록(pStatus.windows) CRUD → /player/windows. 각 창에 모니터/좌표/크기/
// 비율/배경 지정.
import { computed, ref, watch, onMounted } from 'vue'
import { useStatusStore } from 'src/stores/useStatus'
import { useApiStore } from 'src/stores/useApi'
import { useSourcesStore } from 'src/stores/useSources'
import { storeToRefs } from 'pinia'
import DelayedTooltip from '../DelayedTooltip.vue'
import InfoHint from 'src/components/ui/InfoHint.vue'
import WindowLayoutCanvas from './WindowLayoutCanvas.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  // 현재 배치 캔버스 높이 (레이아웃 페이지에서 더 크게 쓰기 위해 조절 가능). autoHeight면 최소값으로 쓰임.
  canvasHeight: { type: Number, default: 400 },
  // true면 캔버스가 컨테이너 폭에 맞춰 자동으로 커진다(화면 확대 시 크게).
  canvasAutoHeight: { type: Boolean, default: false },
})

const { t } = useI18n()
const { pStatus } = storeToRefs(useStatusStore())
const { apiCallWithLoading } = useApiStore()
const sourcesStore = useSourcesStore()
const { sources } = storeToRefs(sourcesStore)
const canvasHeight = computed(() => props.canvasHeight)

// 모니터 목록 갱신 — 출력 창 편집(모니터 선택)에 필요.
onMounted(() => {
  useStatusStore().getDisplays()
  sourcesStore.getSources() // 창 귀속용 라이브 소스 목록
})

// 창에 귀속할 라이브 소스 선택지 (없음 + 등록된 소스들)
const sourceOptions = computed(() => [
  { label: t('sources.none'), value: null },
  ...sources.value.map((s) => ({ label: `${s.name} (${s.kind.toUpperCase()})`, value: s.id })),
])
// 창 귀속 소스 변경 → 즉시 저장(라이브 부착/해제)
const onSourceChange = (w, val) => {
  w.sourceId = val
  saveWindow(w)
}
const canvasAutoHeight = computed(() => props.canvasAutoHeight)

// 창 전용 오디오 출력 디바이스 선택지: 전역 따름(null) + 열람된 디바이스 (ASIO/WASAPI 표시).
const audioDeviceOptions = computed(() => [
  { label: t('setup.windows.audioDeviceGlobal'), value: null },
  ...(pStatus.value.audioDevices || [])
    .filter((d) => d.deviceId)
    .map((d) => ({
      label: `${String(d.deviceId).startsWith('asio:') ? 'ASIO' : 'WASAPI'} · ${d.name || d.deviceId}${
        d.channels ? ` (${d.channels}ch)` : ''
      }`,
      value: d.deviceId,
    })),
])
// 디바이스 변경 → 즉시 저장 (백엔드가 창을 재생성해 새 출력 버스로 연결)
const onAudioDeviceChange = (w, val) => {
  w.audioDevice = val || null
  saveWindow(w)
}
// 뮤트는 운영 동작 — 전용 엔드포인트(배치 프리셋 표시 유지)
const onMuteChange = (w, val) => {
  w.muted = val
  apiCallWithLoading(`/player/windows/${w.id}/mute`, 'PUT', { muted: val }, t('setup.windows.applying'))
}
// 지정 디바이스가 현재 목록에 없음(분리/미설치) — 플레이어는 전역 디바이스로 폴백
const audioDeviceMissing = (w) =>
  !!w.audioDevice && !(pStatus.value.audioDevices || []).some((d) => d.deviceId === w.audioDevice)

const windows = computed(() => pStatus.value.windows || [])
const displays = computed(() => pStatus.value.displays || [])
const playerWindows = computed(() => pStatus.value.playerWindows || [])

// 창이 많아지면 세로로 길어지므로 창별 편집은 탭으로. activeTab = 선택된 창 id.
const activeTab = ref(null)
watch(
  windows,
  (ws) => {
    if (!ws || !ws.length) {
      activeTab.value = null
    } else if (!ws.some((w) => w.id === activeTab.value)) {
      activeTab.value = ws[0].id
    }
  },
  { immediate: true },
)

const aspectOptions = computed(() => [
  { label: t('setup.windows.aspect.letterbox'), value: 'letterbox' },
  { label: t('setup.windows.aspect.crop'), value: 'crop' },
  { label: t('setup.windows.aspect.stretch'), value: 'stretch' },
])

// 모니터 선택: 값 = 고정 모니터 key (재부팅/늦게 켜지는 모니터로 순번이 밀려도 같은 모니터 유지).
// key를 못 얻은 모니터는 순번(idx:N)으로. 창의 모니터가 지금 연결돼 있지 않으면 '연결 안 됨' 항목 추가.
const displayValue = (d) => d.key || `idx:${d.index}`
const monitorValueOf = (w) => {
  if (w.monitorIndex === -1) return -1
  if (w.monitorKey) return w.monitorKey
  return `idx:${w.monitorIndex}`
}
const monitorOptionsFor = (w) => {
  const opts = [{ label: t('setup.windows.primaryMonitor'), value: -1 }]
  for (const d of displays.value) {
    const name = d.name ? `${d.name} · ` : ''
    opts.push({
      label: `#${d.index}${d.primary ? t('setup.windows.primarySuffix') : ''} · ${name}${d.width}×${d.height}`,
      value: displayValue(d),
    })
  }
  if (w.monitorKey && !displays.value.some((d) => d.key === w.monitorKey)) {
    opts.push({
      label: `${w.monitorName || t('setup.windows.monitor')} · ${t('setup.windows.monitorDisconnected')}`,
      value: w.monitorKey,
    })
  }
  return opts
}
const onMonitorChange = (w, val) => {
  if (val === -1) {
    Object.assign(w, { monitorIndex: -1, monitorKey: null, monitorSerial: null, monitorName: null })
    return
  }
  const d = displays.value.find((x) => displayValue(x) === val)
  if (!d) return // '연결 안 됨' 항목 재선택 = 변경 없음
  Object.assign(w, {
    monitorIndex: d.index,
    monitorKey: d.key || null,
    monitorSerial: d.serial || null,
    monitorName: d.name || null,
  })
}
// 창의 대상 모니터가 미연결이라 플레이어가 숨겨 둔 상태
const isDetached = (id) =>
  playerWindows.value.some((w) => w.window_id === id && w.monitor_connected === false)

const isLive = (id) => playerWindows.value.some((w) => w.window_id === id)

// audioOnly=true → 화면 송출 없는 오디오 전용 창 (플레이어가 Win32 창/비디오 그래프를 만들지 않음)
const addWindow = async (audioOnly = false) => {
  const n = windows.value.filter((w) => !!w.audioOnly === audioOnly).length + 1
  const res = await apiCallWithLoading(
    `/player/windows`,
    'POST',
    {
      name: audioOnly
        ? t('setup.windows.defaultAudioName', { n })
        : t('setup.windows.defaultName', { n }),
      audioOnly,
      monitorIndex: -1,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      aspectMode: 'letterbox',
      backgroundColor: '#000000',
      zOrder: 0,
    },
    t('setup.windows.creating'),
  )
  const id = res?.data?.window?.id
  if (id != null) activeTab.value = id // 새 창 탭으로 전환
}

const saveWindow = (w) =>
  apiCallWithLoading(
    `/player/windows/${w.id}`,
    'PUT',
    {
      name: w.name,
      monitorIndex: Number(w.monitorIndex),
      monitorKey: w.monitorKey ?? null, // 고정 모니터 식별 (재부팅해도 같은 모니터)
      monitorSerial: w.monitorSerial ?? null,
      monitorName: w.monitorName ?? null,
      x: Number(w.x) || 0,
      y: Number(w.y) || 0,
      width: Number(w.width) || 0,
      height: Number(w.height) || 0,
      aspectMode: w.aspectMode,
      backgroundColor: w.backgroundColor,
      zOrder: Number(w.zOrder) || 0,
      sourceId: w.sourceId ?? null, // 창에 귀속된 라이브 입력 소스 (없으면 null)
      audioOnly: !!w.audioOnly,
      audioDevice: w.audioDevice ?? null,
    },
    t('setup.windows.applying'),
  )

const removeWindow = (id) =>
  apiCallWithLoading(`/player/windows/${id}`, 'DELETE', null, t('setup.windows.deleting'))

// 오디오 전용 전환 → 즉시 저장 (백엔드가 플레이어 창을 재생성)
const onAudioOnlyChange = (w, val) => {
  w.audioOnly = val
  saveWindow(w)
}

// 그래픽 배치 캔버스에서 드래그/리사이즈 → 해당 창 config 갱신 후 저장
const onLayoutUpdate = (id, patch) => {
  const w = windows.value.find((x) => x.id === id)
  if (!w) return
  Object.assign(w, patch)
  saveWindow(w)
}

</script>

<template>
  <div>
    <div class="row items-center q-mb-sm">
      <InfoHint v-if="windows.length" :msg="$t('setup.windows.layoutHint')" size="18px" />
      <q-space />
      <q-btn-dropdown flat dense no-caps color="primary" icon="add" :label="$t('common.add')">
        <q-list dense>
          <q-item v-close-popup clickable @click="addWindow(false)">
            <q-item-section avatar><q-icon name="tv" /></q-item-section>
            <q-item-section>{{ $t('setup.windows.add') }}</q-item-section>
          </q-item>
          <q-item v-close-popup clickable @click="addWindow(true)">
            <q-item-section avatar><q-icon name="volume_up" /></q-item-section>
            <q-item-section>{{ $t('setup.windows.addAudioOnly') }}</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>

    <div v-if="windows.length === 0" class="text-caption text-muted q-pa-sm">
      {{ $t('setup.windows.empty') }}
    </div>

    <!-- 좌: 모니터 배치 캔버스 + 창 선택 탭 / 우: 선택 창 편집 폼 (2단) -->
    <div v-if="windows.length" class="row q-col-gutter-md">
      <div class="col-12 col-md-7">
        <WindowLayoutCanvas
          editable
          :height="canvasHeight"
          :auto-height="canvasAutoHeight"
          @update="onLayoutUpdate"
        />
      </div>

      <div class="col-12 col-md-5">
        <q-tabs
          v-model="activeTab"
          dense
          inline-label
          outside-arrows
          mobile-arrows
          align="right"
          active-color="primary"
          indicator-color="primary"
          class="text-muted win-tabs q-mb-sm"
        >
          <q-tab v-for="w in windows" :key="w.id" :name="w.id" no-caps>
            <div class="row items-center no-wrap q-gutter-x-xs">
              <q-icon
                name="circle"
                size="8px"
                :color="isDetached(w.id) ? 'warning' : isLive(w.id) ? 'positive' : 'grey-6'"
              />
              <q-icon v-if="w.audioOnly" name="volume_up" size="14px" />
              <span>{{ w.name }}</span>
            </div>
          </q-tab>
        </q-tabs>
        <q-tab-panels v-model="activeTab" animated class="win-panels">
        <q-tab-panel v-for="w in windows" :key="w.id" :name="w.id" class="q-pa-sm">
          <div class="row items-center q-gutter-x-sm q-mb-sm">
            <q-input v-model="w.name" dense outlined :label="$t('common.name')" class="col" />
            <q-btn dense flat round icon="save" color="primary" @click="saveWindow(w)">
              <DelayedTooltip :msg="$t('common.apply')" />
            </q-btn>
            <q-btn dense flat round icon="delete" color="negative" @click="removeWindow(w.id)">
              <DelayedTooltip :msg="$t('common.delete')" />
            </q-btn>
          </div>
          <!-- 오디오 전용 (화면 송출 없음) — 켜면 화면 관련 설정(모니터/위치/표시)은 무의미하므로 숨김 -->
          <div class="field-group">
            <q-toggle
              :model-value="!!w.audioOnly"
              @update:model-value="(v) => onAudioOnlyChange(w, v)"
              dense
              :label="$t('setup.windows.audioOnly')"
            />
            <InfoHint :msg="$t('setup.windows.audioOnlyHint')" class="q-ml-xs" />
          </div>

          <template v-if="!w.audioOnly">
          <!-- 출력 대상: 모니터 + 비율 -->
          <div class="field-group">
            <div class="field-group__title">{{ $t('setup.windows.groupTarget') }}</div>
            <div class="row q-col-gutter-sm">
              <q-select
                class="col-12 col-sm-6"
                :model-value="monitorValueOf(w)"
                @update:model-value="(v) => onMonitorChange(w, v)"
                :options="monitorOptionsFor(w)"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                dense
                outlined
                options-dense
                :label="$t('setup.windows.monitor')"
              />
              <q-select
                class="col-12 col-sm-6"
                v-model="w.aspectMode"
                :options="aspectOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                dense
                outlined
                options-dense
                :label="$t('setup.windows.aspectMode')"
              />
            </div>
            <div v-if="isDetached(w.id)" class="row items-center text-caption text-muted q-mt-xs">
              <q-icon name="circle" size="8px" color="warning" class="q-mr-xs" />
              {{ $t('setup.windows.detachedHint') }}
            </div>
          </div>

          <!-- 위치/크기/표시는 기본 접힘 — 캔버스에서 드래그로 대부분 조정 가능 -->
          <q-expansion-item dense dense-toggle :label="$t('common.advanced')" class="adv-box q-mt-sm">

          <!-- 위치 · 크기 (px) -->
          <div class="field-group">
            <div class="field-group__title">{{ $t('setup.windows.groupGeometry') }}</div>
            <div class="row q-col-gutter-sm">
              <q-input class="col-6" v-model.number="w.x" type="number" dense outlined label="X" suffix="px" />
              <q-input class="col-6" v-model.number="w.y" type="number" dense outlined label="Y" suffix="px" />
              <q-input class="col-6" v-model.number="w.width" type="number" dense outlined :label="$t('setup.windows.width')" suffix="px" />
              <q-input class="col-6" v-model.number="w.height" type="number" dense outlined :label="$t('setup.windows.height')" suffix="px" />
            </div>
            <div class="row items-center text-caption text-muted q-mt-xs">
              <InfoHint :msg="$t('setup.windows.sizeHint')" />
            </div>
          </div>

          <!-- 표시: 배경색 + Z-order -->
          <div class="field-group">
            <div class="field-group__title">{{ $t('setup.windows.groupAppearance') }}</div>
            <div class="row q-col-gutter-sm items-start">
              <q-input
                class="col-12 col-sm-6"
                v-model="w.backgroundColor"
                dense
                outlined
                :label="$t('setup.windows.backgroundColor')"
              >
                <template #append>
                  <input type="color" v-model="w.backgroundColor" class="color-swatch" />
                </template>
              </q-input>
              <q-input
                class="col-6"
                v-model.number="w.zOrder"
                type="number"
                dense
                outlined
                :label="$t('setup.windows.zOrder')"
              >
                <DelayedTooltip :msg="$t('setup.windows.zOrderHint')" />
              </q-input>
            </div>
          </div>
          </q-expansion-item>
          </template>

          <!-- 오디오: 창 전용 출력 디바이스 + 창 오디오 전체 뮤트 -->
          <div class="field-group">
            <div class="field-group__title">{{ $t('setup.windows.groupAudio') }}</div>
            <q-select
              :model-value="w.audioDevice ?? null"
              @update:model-value="(v) => onAudioDeviceChange(w, v)"
              :options="audioDeviceOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              dense
              outlined
              options-dense
              :label="$t('setup.windows.audioDevice')"
            >
              <DelayedTooltip :msg="$t('setup.windows.audioDeviceHint')" />
            </q-select>
            <div v-if="audioDeviceMissing(w)" class="row items-center text-caption text-muted q-mt-xs">
              <q-icon name="circle" size="8px" color="warning" class="q-mr-xs" />
              {{ $t('setup.windows.audioDeviceMissing') }}
            </div>
            <q-toggle
              class="q-mt-xs"
              :model-value="!!w.muted"
              @update:model-value="(v) => onMuteChange(w, v)"
              dense
              :label="$t('setup.windows.muted')"
            />
          </div>

          <!-- 라이브 입력 소스 귀속: 창에 RTP/RTSP/SRT/NDI 소스를 붙여 플레이리스트와 무관하게 상시 재생 -->
          <div class="field-group">
            <div class="field-group__title">{{ $t('sources.title') }}</div>
            <q-select
              :model-value="w.sourceId ?? null"
              @update:model-value="(v) => onSourceChange(w, v)"
              :options="sourceOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              dense
              outlined
              options-dense
              clearable
              :label="$t('sources.boundTo')"
            />
            <div
              v-if="w.sourceId && pStatus.sourceStates?.[w.id]"
              class="row items-center text-caption text-muted q-mt-xs"
            >
              <q-icon
                name="circle"
                size="8px"
                :color="{ playing: 'positive', error: 'negative', connecting: 'warning', reconnecting: 'warning' }[pStatus.sourceStates[w.id].state] || 'grey-5'"
                class="q-mr-xs"
              />
              {{ $t('sources.states.' + pStatus.sourceStates[w.id].state) }}
            </div>
          </div>
        </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </div>
</template>

<style scoped>
.win-tabs {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.win-panels {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.field-group {
  margin-top: 10px;
}
.adv-box {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.field-group__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 6px;
}
.color-swatch {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}
</style>
