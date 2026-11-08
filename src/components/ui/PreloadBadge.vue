<script setup>
// 프리로드 상태 배지 — loaded/ready/playing.
// ready=프리롤 완료(positive), loaded=로딩 중(warning+스피너), 그 외 미로딩(grey, 옵션).
defineProps({
  loaded: { type: Boolean, default: false },
  ready: { type: Boolean, default: false },
  playing: { type: Boolean, default: false },
  showNotLoaded: { type: Boolean, default: true },
})
</script>

<template>
  <span class="row items-center no-wrap q-gutter-x-xs">
    <q-badge v-if="ready" color="positive">{{ $t('common.loaded') }}</q-badge>
    <q-badge v-else-if="loaded" color="warning" class="row items-center no-wrap">
      <q-spinner size="12px" class="q-mr-xs" />{{ $t('common.loading') }}
    </q-badge>
    <q-badge v-else-if="showNotLoaded" color="grey">{{ $t('common.notLoaded') }}</q-badge>
    <q-badge v-if="playing" color="primary">{{ $t('common.playing') }}</q-badge>
  </span>
</template>

<style scoped></style>
