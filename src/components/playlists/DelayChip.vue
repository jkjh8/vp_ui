<script setup>
// 재생 지연(ms) 표시/편집 — 값을 바로 입력칸에 표시 (클릭해 숨은 팝업을 열 필요 없음).
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  step: { type: Number, default: 100 },
})
const emit = defineEmits(['save'])
const onChange = (e) => emit('save', Math.max(0, Number(e.target.value) || 0))
</script>

<template>
  <span class="delay-chip row items-center no-wrap" @click.stop>
    <q-icon name="timer" size="14px" color="grey-6" class="q-mr-xs">
      <q-tooltip>{{ $t('playlists.tracksView.delay') }}</q-tooltip>
    </q-icon>
    <input
      class="delay-input"
      type="number"
      min="0"
      :step="props.step"
      :value="props.modelValue"
      @change="onChange"
    />
    <span class="delay-unit">{{ $t('playlists.tracksView.ms') }}</span>
  </span>
</template>

<style scoped>
.delay-chip {
  display: inline-flex;
}
.delay-input {
  width: 3.2rem;
  height: 1.7rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background-color: var(--surface-1);
  color: inherit;
  font-family: inherit;
  font-size: 12px;
  text-align: right;
  padding: 0 4px;
  outline: none;
}
.delay-input:focus {
  border-color: var(--accent);
}
.delay-unit {
  font-size: 11px;
  color: var(--text-muted, #999);
  margin-left: 3px;
}
</style>
