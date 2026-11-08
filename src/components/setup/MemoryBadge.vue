<script setup>
// 상단 헤더 상시 가용 메모리 배지 — 어느 페이지에서든 시스템 가용 메모리를 항상 표시.
// 데이터: pStatus.memory (플레이어 memory_status 1초 피드백, socketio 라이브). 호버 시 상세 팝업.
import { computed } from 'vue'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'

const { pStatus } = storeToRefs(useStatusStore())
const mem = computed(() => pStatus.value.memory || {})
const hasData = computed(() => Object.keys(mem.value).length > 0)

const fmt = (bytes) => {
  if (!Number.isFinite(bytes)) return '—'
  const gb = bytes / 1024 / 1024 / 1024
  if (gb >= 1) return gb.toFixed(1) + ' GB'
  return (bytes / 1024 / 1024).toFixed(0) + ' MB'
}

// 시스템 사용률 (0~100)
const usedPct = computed(() => {
  const m = mem.value
  if (Number.isFinite(m.sys_load_percent)) return m.sys_load_percent
  if (Number.isFinite(m.sys_total_bytes) && Number.isFinite(m.sys_avail_bytes) && m.sys_total_bytes > 0) {
    return Math.round(((m.sys_total_bytes - m.sys_avail_bytes) / m.sys_total_bytes) * 100)
  }
  return 0
})
const level = computed(() => (usedPct.value >= 90 ? 'crit' : usedPct.value >= 75 ? 'warn' : 'ok'))
</script>

<template>
  <div v-if="!hasData || level !== 'ok'" class="mem-badge" :class="`mem-${level}`" role="status" :aria-label="$t('setup.memoryBadge.availAria')">
    <q-icon name="memory" size="16px" />
    <span class="mem-avail">{{ hasData ? fmt(mem.sys_avail_bytes) : '—' }}</span>
    <span class="mem-cap">{{ $t('setup.memoryBadge.avail') }}</span>
    <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 6]" class="mem-tip">
      <div v-if="hasData" class="mem-tip-body">
        <div class="row items-center justify-between">
          <span>{{ $t('setup.memoryBadge.systemMemory') }}</span>
          <span>{{ $t('setup.memoryBadge.availOfTotal', { avail: fmt(mem.sys_avail_bytes), total: fmt(mem.sys_total_bytes) }) }}</span>
        </div>
        <div class="tip-bar"><div class="tip-bar-fill" :class="`mem-${level}`" :style="{ width: usedPct + '%' }" /></div>
        <div class="tip-sub">
          {{ $t('setup.memoryBadge.tipSub', { rss: fmt(mem.rss_bytes), surfaces: mem.surfaces ?? 0, live: mem.live_decks ?? 0, preroll: mem.prerolled_decks ?? 0 }) }}<template v-if="mem.pool_decks">{{ $t('setup.memoryBadge.tipPool', { pool: mem.pool_decks }) }}</template>
        </div>
      </div>
      <div v-else>{{ $t('setup.memoryBadge.noData') }}</div>
    </q-tooltip>
  </div>
</template>

<style scoped>
.mem-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: var(--radius-pill, 999px);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  cursor: default;
  border: 1px solid transparent;
}
.mem-avail {
  font-weight: 700;
}
.mem-cap {
  opacity: 0.7;
}
.mem-ok {
  background: rgba(59, 130, 246, 0.14);
  color: #93c5fd;
  border-color: rgba(59, 130, 246, 0.3);
}
.mem-warn {
  background: rgba(249, 168, 37, 0.16);
  color: #fbbf24;
  border-color: rgba(249, 168, 37, 0.35);
}
.mem-crit {
  background: rgba(229, 57, 53, 0.18);
  color: #fca5a5;
  border-color: rgba(229, 57, 53, 0.4);
}
.mem-tip-body {
  min-width: 240px;
  font-size: 12px;
}
.tip-bar {
  height: 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.18);
  overflow: hidden;
  margin: 5px 0;
}
.tip-bar-fill {
  height: 100%;
}
.tip-bar-fill.mem-ok {
  background: #3b82f6;
}
.tip-bar-fill.mem-warn {
  background: #f9a825;
}
.tip-bar-fill.mem-crit {
  background: #e53935;
}
.tip-sub {
  opacity: 0.85;
}
</style>
