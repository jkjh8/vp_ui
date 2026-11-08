<script setup>
// 설정 섹션 카드 — 제목 + 아이콘, 내부에 SettingRow들을 담는다.
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  danger: { type: Boolean, default: false },
})
</script>

<template>
  <div class="app-card settings-section q-mb-md">
    <div class="row items-center q-gutter-x-sm section-head">
      <q-icon v-if="icon" :name="icon" :color="danger ? 'negative' : 'primary'" size="sm" />
      <div class="text-title" :class="{ 'text-negative': danger }">{{ title }}</div>
    </div>
    <q-separator class="q-my-sm" />
    <slot />
  </div>
</template>

<style scoped>
.settings-section {
  padding: 1rem 1.25rem;
}
.section-head {
  min-height: 1.75rem;
}
</style>
