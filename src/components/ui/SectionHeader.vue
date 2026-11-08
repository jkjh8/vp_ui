<script setup>
// 카드/구획 헤더 — 아이콘 + 제목 + 우측 액션 슬롯. (app-card 내부에서 사용)
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
  danger: { type: Boolean, default: false },
})
</script>

<template>
  <div class="row items-center no-wrap section-header">
    <q-icon
      v-if="icon"
      :name="icon"
      :color="danger ? 'negative' : 'primary'"
      size="sm"
      class="q-mr-sm"
    />
    <div class="text-title" :class="{ 'text-negative': danger }">
      <slot name="title">{{ title }}</slot>
    </div>
    <q-space />
    <div class="row items-center no-wrap q-gutter-x-xs">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.section-header {
  min-height: 1.75rem;
}
</style>
