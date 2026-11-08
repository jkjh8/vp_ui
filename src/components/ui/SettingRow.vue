<script setup>
// 설정 항목 행 — 좌측 아이콘+라벨(+값 캡션), 우측 #control 슬롯(토글/버튼/셀렉트 등).
// setup 컴포넌트 공용.
defineProps({
  icon: { type: String, default: '' },
  label: { type: String, required: true },
  caption: { type: String, default: '' },
})
</script>

<template>
  <div class="row items-center justify-between no-wrap setting-row">
    <div class="row items-center q-gutter-x-sm no-wrap">
      <q-icon v-if="icon" :name="icon" color="primary" size="sm" />
      <div>
        <div class="text-body2 text-weight-medium">{{ label }}</div>
        <div v-if="caption || $slots.caption" class="text-caption text-muted">
          <slot name="caption">{{ caption }}</slot>
        </div>
      </div>
    </div>
    <div class="row items-center q-gutter-x-sm no-wrap">
      <slot name="control" />
    </div>
  </div>
</template>

<style scoped>
.setting-row {
  padding: 0.5rem 0;
  min-height: 2.75rem;
}
</style>
