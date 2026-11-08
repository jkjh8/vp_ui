<script setup>
// 다이얼로그 표준 셸 — 스타일된 카드 + 헤더(아이콘/제목) + 본문 슬롯 + 액션 슬롯.
// dialogRef/useDialogPluginComponent는 이 컴포넌트를 여는 "구체 다이얼로그"가 소유하고,
// 그 안에서 <q-dialog ref><BaseDialog>…</BaseDialog></q-dialog> 형태로 감싼다.
defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  danger: { type: Boolean, default: false },
  minWidth: { type: String, default: '360px' },
  maxWidth: { type: String, default: '90vw' },
})
</script>

<template>
  <q-card class="dialog-card column no-wrap" :style="`min-width:${minWidth};max-width:${maxWidth}`">
    <q-card-section v-if="title || icon || $slots['header-actions']" class="row items-center no-wrap q-gutter-x-sm">
      <q-icon v-if="icon" :name="icon" size="sm" :color="danger ? 'negative' : 'primary'" />
      <div class="text-title" :class="{ 'text-negative': danger }">{{ title }}</div>
      <q-space />
      <slot name="header-actions" />
    </q-card-section>
    <q-separator v-if="title || icon || $slots['header-actions']" />

    <q-card-section class="col scroll">
      <slot />
    </q-card-section>

    <template v-if="$slots.actions">
      <q-separator />
      <q-card-actions align="right" class="q-pa-md">
        <slot name="actions" />
      </q-card-actions>
    </template>
  </q-card>
</template>

<style scoped></style>
