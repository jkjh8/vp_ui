<script setup>
// 창(window) 칩 — 이름 + (옵션) 파일명 + 활성 표시 + (옵션) 창별 재생/정지/반복 컨트롤.
defineProps({
  name: { type: String, default: '' },
  filename: { type: String, default: '' },
  active: { type: Boolean, default: false },
  controls: { type: Boolean, default: false },
  // 창별 반복 모드 'none'|'all'|'repeat_one' (controls 시 반복 토글 버튼 표시). null이면 버튼 숨김.
  repeat: { type: String, default: null },
  // 창 오디오 전체 뮤트 상태 (뮤트 토글 버튼 표시). null이면 버튼 숨김.
  muted: { type: Boolean, default: null },
})
defineEmits(['play', 'stop', 'repeat', 'mute'])
</script>

<template>
  <div class="window-chip" :class="{ 'window-chip--on': active }">
    <q-icon name="tv" size="14px" class="q-mr-xs" />
    <span class="text-weight-medium ellipsis chip-name">{{ name }}</span>
    <span v-if="filename" class="text-caption text-muted q-ml-xs ellipsis chip-file">{{
      filename
    }}</span>
    <q-space v-if="controls || muted != null" />
    <!-- 창 오디오 뮤트: 컨트롤 유무와 무관하게 표시 (씬형 읽기 전용 칩에서도 운영 중 뮤트 가능) -->
    <q-btn
      v-if="muted != null"
      dense
      flat
      round
      size="sm"
      :icon="muted ? 'volume_off' : 'volume_up'"
      :color="muted ? 'negative' : 'grey-7'"
      @click.stop="$emit('mute')"
    >
      <q-tooltip>{{
        muted ? $t('controls.controlBtns.unmuteWindow') : $t('controls.controlBtns.muteWindow')
      }}</q-tooltip>
    </q-btn>
    <template v-if="controls">
      <q-btn
        v-if="repeat != null"
        dense
        flat
        round
        size="sm"
        :icon="repeat === 'repeat_one' ? 'repeat_one' : 'repeat'"
        :color="repeat === 'none' ? 'grey-5' : 'primary'"
        @click.stop="$emit('repeat')"
      >
        <q-tooltip>{{
          repeat === 'all'
            ? $t('controls.controlBtns.repeatAll')
            : repeat === 'repeat_one'
              ? $t('controls.controlBtns.repeatOne')
              : $t('controls.controlBtns.repeatNone')
        }}</q-tooltip>
      </q-btn>
      <q-btn
        dense
        flat
        round
        size="sm"
        icon="play_arrow"
        color="primary"
        @click.stop="$emit('play')"
      >
        <q-tooltip>{{ $t('common.play') }}</q-tooltip>
      </q-btn>
      <q-btn
        dense
        flat
        round
        size="sm"
        icon="stop"
        color="negative"
        :disable="!active"
        @click.stop="$emit('stop')"
      >
        <q-tooltip>{{ $t('common.stop') }}</q-tooltip>
      </q-btn>
    </template>
  </div>
</template>

<style scoped>
.window-chip {
  display: flex;
  align-items: center;
  min-width: 200px;
  max-width: 320px;
  padding: 2px 4px 2px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  font-size: 13px;
}
.window-chip--on {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent) inset;
}
.chip-name {
  min-width: 0;
}
.chip-file {
  min-width: 0;
  flex: 1;
}
</style>
