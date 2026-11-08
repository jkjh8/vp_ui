<script setup>
// 플레이어 간 클럭 오차 진단 — 각 슬레이브의 PTP 절대시각을 마스터와 왕복 비교(RTT 보정)한 오프셋 표시.
// 수동 측정 + 자동(2s) 폴링 토글. 동일 머신 2 인스턴스는 오프셋 ≈ 0, 2 PC면 실제 PTP 잔차가 보인다.
import { ref, onBeforeUnmount } from 'vue'
import { useFleet } from 'src/composables/useFleet'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const $q = useQuasar()
const fleet = useFleet()

const rows = ref([])
const measuredAt = ref(null)
const busy = ref(false)
const auto = ref(false)
let timer = null

// ns 오프셋을 사람이 읽기 좋은 단위로 (절대값 기준 µs/ms). 부호 유지.
const fmtOffset = (ns) => {
  if (ns == null || !Number.isFinite(ns)) return '—'
  const a = Math.abs(ns)
  const sign = ns < 0 ? '-' : '+'
  if (a < 1000) return `${sign}${a} ns`
  if (a < 1e6) return `${sign}${(a / 1e3).toFixed(1)} µs`
  return `${sign}${(a / 1e6).toFixed(2)} ms`
}
// 색: |offset| < 1ms positive, < 10ms warning, 그 이상 negative
const offColor = (ns) => {
  if (ns == null || !Number.isFinite(ns)) return 'grey'
  const a = Math.abs(ns)
  if (a < 1e6) return 'positive'
  if (a < 1e7) return 'warning'
  return 'negative'
}

const measure = async () => {
  busy.value = true
  try {
    const d = await fleet.diag()
    rows.value = d.players || []
    measuredAt.value = d.at
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.error || e.message })
  } finally {
    busy.value = false
  }
}

const toggleAuto = (v) => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (v) {
    measure()
    timer = setInterval(measure, 2000)
  }
}

onBeforeUnmount(() => timer && clearInterval(timer))
</script>

<template>
  <q-card flat bordered class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-icon name="timeline" size="sm" class="q-mr-sm" />
      <span class="text-bold">{{ t('fleet.diag.title') }}</span>
      <q-space />
      <q-toggle v-model="auto" :label="t('fleet.diag.auto')" dense @update:model-value="toggleAuto" />
      <q-btn round flat dense icon="speed" :loading="busy" class="q-ml-sm" @click="measure">
        <q-tooltip>{{ t('fleet.diag.measure') }}</q-tooltip>
      </q-btn>
    </div>

    <q-markup-table dense flat class="diag-table">
      <thead>
        <tr>
          <th class="text-left">{{ t('fleet.diag.player') }}</th>
          <th class="text-center">{{ t('fleet.diag.synced') }}</th>
          <th class="text-right">{{ t('fleet.diag.offset') }}</th>
          <th class="text-right">{{ t('fleet.diag.rtt') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <td class="text-left">
            {{ r.name }}
            <q-badge v-if="r.self" outline color="primary" class="q-ml-xs" label="master" />
          </td>
          <td class="text-center">
            <q-icon
              :name="r.synced ? 'check_circle' : 'radio_button_unchecked'"
              :color="r.synced ? 'positive' : 'grey'"
              size="xs"
            />
          </td>
          <td class="text-right">
            <span v-if="r.error" class="text-negative">{{ r.error }}</span>
            <q-badge v-else-if="r.self" outline color="grey" label="ref" />
            <q-badge v-else :color="offColor(r.offsetNs)" :label="fmtOffset(r.offsetNs)" />
          </td>
          <td class="text-right text-caption text-muted">
            {{ r.self ? '—' : `${r.rttMs} ms` }}
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="4" class="text-center text-muted">{{ t('fleet.diag.na') }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </q-card>
</template>

<style scoped>
.diag-table th {
  font-weight: 600;
}
</style>
