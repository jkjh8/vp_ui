<script setup>
// 설명/힌트용 ⓘ 아이콘 — 호버(터치 시 탭) 하면 툴팁으로 상세 문구를 보여준다.
// 화면에 상시 노출하던 긴 설명문을 옮겨 담는 용도. 줄바꿈은 \n 으로.
defineProps({
  msg: { type: String, required: true },
  size: { type: String, default: '16px' },
})
</script>

<template>
  <q-icon name="info_outline" :size="size" class="info-hint text-faint">
    <q-tooltip
      anchor="bottom middle"
      self="top middle"
      :offset="[0, 6]"
      :delay="200"
      max-width="320px"
      class="info-hint-tip"
    >
      {{ msg }}
    </q-tooltip>
  </q-icon>
</template>

<style scoped>
.info-hint {
  cursor: help;
  vertical-align: middle;
}
.info-hint-tip {
  white-space: pre-line;
}
</style>
