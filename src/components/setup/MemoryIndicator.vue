<script setup>
// 메모리 인디케이터 — 전 트랙 프리롤 압박 가시화.
// 플레이어 memory_status 피드백(pStatus.memory)을 표시: 시스템 가용/총 메모리 막대 +
// 플레이어 RSS + 창/프리롤 덱 수. 상한 접근 시 경고색.
import { computed } from 'vue'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'

const { pStatus } = storeToRefs(useStatusStore())

const mem = computed(() => pStatus.value.memory || {})

const fmt = (bytes) => {
  if (!Number.isFinite(bytes)) return '—'
  const gb = bytes / 1024 / 1024 / 1024
  if (gb >= 1) return gb.toFixed(1) + ' GB'
  return (bytes / 1024 / 1024).toFixed(0) + ' MB'
}

// 시스템 사용률 (0~100). sys_load_percent 우선, 없으면 avail/total로 계산.
const usedPct = computed(() => {
  const m = mem.value
  if (Number.isFinite(m.sys_load_percent)) return m.sys_load_percent
  if (Number.isFinite(m.sys_total_bytes) && Number.isFinite(m.sys_avail_bytes) && m.sys_total_bytes > 0) {
    return Math.round(((m.sys_total_bytes - m.sys_avail_bytes) / m.sys_total_bytes) * 100)
  }
  return 0
})

const barColor = computed(() => {
  const p = usedPct.value
  if (p >= 90) return 'var(--negative, #e53935)'
  if (p >= 75) return 'var(--warning, #f9a825)'
  return 'var(--accent, #3b82f6)'
})

const hasData = computed(() => Object.keys(mem.value).length > 0)
</script>

<template>
  <div class="mem-indicator" v-if="hasData">
    <div class="mem-row">
      <q-icon name="memory" size="16px" class="text-muted" />
      <span class="mem-label">{{ $t('setup.memoryIndicator.memory') }}</span>
      <span class="mem-val">{{ $t('setup.memoryIndicator.availOfTotal', { avail: fmt(mem.sys_avail_bytes), total: fmt(mem.sys_total_bytes) }) }}</span>
    </div>
    <div class="mem-bar">
      <div class="mem-bar-fill" :style="{ width: usedPct + '%', background: barColor }" />
      <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 6]">
        <div>{{ $t('setup.memoryIndicator.player', { rss: fmt(mem.rss_bytes) }) }}</div>
        <div>{{ $t('setup.memoryIndicator.windows', { n: mem.surfaces ?? 0 }) }}</div>
        <div>{{ $t('setup.memoryIndicator.live', { n: mem.live_decks ?? 0 }) }}</div>
        <div>{{ $t('setup.memoryIndicator.preroll', { n: mem.prerolled_decks ?? 0 }) }}</div>
        <div v-if="mem.pool_decks">{{ $t('setup.memoryIndicator.pool', { n: mem.pool_decks }) }}</div>
      </q-tooltip>
    </div>
  </div>
  <div class="mem-indicator text-muted" v-else>
    <q-icon name="memory" size="16px" /> <span class="mem-sub">{{ $t('setup.memoryIndicator.noData') }}</span>
  </div>
</template>

<style scoped>
.mem-indicator {
  min-width: 200px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-1);
}
.mem-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-2);
}
.mem-label {
  font-weight: 600;
  color: var(--text-1);
}
.mem-val {
  margin-left: auto;
  color: var(--text-1);
}
.mem-bar {
  height: 6px;
  border-radius: 3px;
  background: var(--surface-3);
  overflow: hidden;
  margin: 4px 0;
}
.mem-bar-fill {
  height: 100%;
  transition: width 0.4s ease;
}
.mem-sub {
  font-size: 11px;
  color: var(--text-3);
  gap: 4px;
}
.mem-bar {
  cursor: help;
}
</style>
