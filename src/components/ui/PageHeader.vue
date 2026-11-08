<script setup>
// 페이지 헤더 툴바 — 제목-좌 / 액션-우. 각 페이지 헤더 공용.
// #actions = 우측 버튼들, 기본 슬롯 = 제목줄 아래 부가 영역.
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="page-header q-mb-md">
    <div class="row items-center no-wrap">
      <q-icon v-if="icon" :name="icon" size="md" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-weight-medium ellipsis">{{ title }}</div>
      <q-space />
      <div class="row items-center no-wrap q-gutter-x-sm">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="description" class="text-body2 text-muted q-mt-xs">{{ description }}</div>
    <slot />
  </div>
</template>

<style scoped></style>
