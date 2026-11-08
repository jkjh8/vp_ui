<script setup>
// 멀티 PC 클럭 동기 설정.
// role(standalone/master/slave) + PTP 도메인 + slave IP 목록 + 멀티캐스트 주소/포트 + 리드타임.
// PUT /player/sync. 로컬 PTP 상태(pStatus.sync.ptp) 표시. 2대+PTP 네트워크에서 실동작.
import { computed, ref, watch } from 'vue'
import { useStatusStore } from 'src/stores/useStatus'
import { useApiStore } from 'src/stores/useApi'
import { storeToRefs } from 'pinia'
import DelayedTooltip from '../DelayedTooltip.vue'
import InfoHint from 'src/components/ui/InfoHint.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { pStatus } = storeToRefs(useStatusStore())
const { apiCallWithLoading } = useApiStore()

const sync = computed(() => pStatus.value.sync || {})
const ptp = computed(() => sync.value.ptp || {})

const role = ref('standalone')
const domain = ref(0)
const multicastAddr = ref('239.255.42.99')
const multicastPort = ref(15002)
const leadMs = ref(1000)
const clockMode = ref('auto')

watch(
  sync,
  (s) => {
    role.value = s.role || 'standalone'
    domain.value = s.domain ?? 0
    multicastAddr.value = s.multicastAddr || '239.255.42.99'
    multicastPort.value = s.multicastPort ?? 15002
    leadMs.value = s.leadMs ?? 1000
    clockMode.value = s.clockMode || 'auto'
  },
  { immediate: true, deep: true },
)

const roleOptions = computed(() => [
  { label: t('setup.syncManager.roleStandalone'), value: 'standalone' },
  { label: t('setup.syncManager.roleMaster'), value: 'master' },
  { label: t('setup.syncManager.roleSlave'), value: 'slave' },
])
const clockOptions = computed(() => [
  { label: t('setup.syncManager.clockAuto'), value: 'auto' },
  { label: t('setup.syncManager.clockPtp'), value: 'ptp' },
  { label: t('setup.syncManager.clockNet'), value: 'netclock' },
])

const fmtNs = (ns) => (Number.isFinite(ns) ? (ns / 1e9).toFixed(3) + ' s' : '—')

// ⓘ 툴팁: 동작 설명 + PTP 러닝타임(진단용)
const syncTip = computed(
  () =>
    t('setup.syncManager.desc', { port: multicastPort.value }) +
    String.fromCharCode(10) +
    t('setup.syncManager.runtime', {
      running: fmtNs(Number(ptp.value.running_time)),
      base: fmtNs(Number(ptp.value.base_time)),
    }),
)

const ptpColor = computed(() =>
  ptp.value.synced ? 'positive' : ptp.value.enabled ? 'warning' : 'grey',
)
const ptpLabel = computed(() =>
  ptp.value.enabled
    ? ptp.value.synced
      ? t('setup.syncManager.ptpSynced')
      : t('setup.syncManager.ptpWaiting')
    : t('setup.syncManager.ptpDisabled'),
)

const save = () => {
  // 슬레이브 목록은 자동 디스커버리로 확보한다(수동 peers 입력 없음).
  return apiCallWithLoading(
    '/player/sync',
    'PUT',
    {
      role: role.value,
      domain: Number(domain.value),
      multicastAddr: multicastAddr.value,
      multicastPort: Number(multicastPort.value),
      leadMs: Number(leadMs.value),
      clockMode: clockMode.value,
    },
    t('setup.syncManager.applying'),
  )
}
</script>

<template>
  <div>
    <!-- 섹션 제목(멀티 PC 동기화)이 이미 있으므로 자체 제목행 없이 PTP 상태 배지 + 설명 툴팁만 -->
    <div class="row items-center q-mb-md q-gutter-x-sm">
      <q-badge :color="ptpColor" :label="$t('setup.syncManager.ptpBadge', { status: ptpLabel })" />
      <InfoHint :msg="syncTip" />
    </div>

    <div class="row q-col-gutter-md">
      <q-select
        class="col-12 col-sm-6"
        v-model="role"
        :options="roleOptions"
        option-label="label"
        option-value="value"
        emit-value
        map-options
        dense
        outlined
        options-dense
        :label="$t('setup.syncManager.role')"
      />
      <q-select
        class="col-12 col-sm-6"
        v-model="clockMode"
        :options="clockOptions"
        option-label="label"
        option-value="value"
        emit-value
        map-options
        dense
        outlined
        options-dense
        :label="$t('setup.syncManager.clockMode')"
      >
        <template #after><InfoHint :msg="$t('setup.syncManager.clockHint')" /></template>
      </q-select>
    </div>

    <div v-if="role === 'master'" class="text-caption text-primary q-mt-sm">
      <q-icon name="devices" size="xs" class="q-mr-xs" />{{ $t('setup.syncManager.masterHint') }}
    </div>

    <!-- 고급: 도메인/리드타임/멀티캐스트 — 보통 기본값 그대로 사용 -->
    <q-expansion-item dense dense-toggle :label="$t('common.advanced')" class="q-mt-sm adv-box">
      <div class="row q-col-gutter-md q-pa-sm">
        <q-input class="col-12 col-sm-6" v-model.number="domain" type="number" min="0" max="127" dense outlined :label="$t('setup.syncManager.domain')" />
        <q-input class="col-12 col-sm-6" v-model.number="leadMs" type="number" min="0" dense outlined :label="$t('setup.syncManager.leadTime')" suffix="ms" />
        <q-input class="col-12 col-sm-6" v-model="multicastAddr" dense outlined :label="$t('setup.syncManager.multicastAddr')" />
        <q-input class="col-12 col-sm-6" v-model.number="multicastPort" type="number" dense outlined :label="$t('setup.syncManager.port')" />
      </div>
    </q-expansion-item>

    <div class="row items-center q-mt-md">
      <q-btn round flat dense color="primary" icon="save" @click="save">
        <DelayedTooltip :msg="$t('common.apply')" />
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
.adv-box {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
</style>

