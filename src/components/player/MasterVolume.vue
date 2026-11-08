<script setup>
// 마스터 볼륨 — 푸터(popup)·홈 컨트롤 센터(inline) 공용.
// variant='popup': 아이콘 버튼 + 팝업 세로 슬라이더 (푸터용).
// variant='inline': 아이콘 + 라벨 + 가로 슬라이더 + 값 (컨트롤 센터용).
import DelayedTooltip from 'src/components/DelayedTooltip.vue'
import { useMasterVolume } from 'src/composables/useMasterVolume'

defineProps({
  variant: { type: String, default: 'popup' }, // 'popup' | 'inline'
})

const { vol, volIcon, onDrag, onChange } = useMasterVolume()
</script>

<template>
  <!-- inline: 컨트롤 센터 가로 바 -->
  <div v-if="variant === 'inline'" class="row items-center no-wrap q-gutter-x-sm full-width">
    <q-icon :name="volIcon" size="20px" color="primary" />
    <span class="text-caption text-muted no-wrap">{{ $t('controls.footerVolume.masterVolume') }}</span>
    <q-slider
      class="col"
      :model-value="vol"
      @update:model-value="onDrag"
      @change="onChange"
      :min="0"
      :max="100"
      :step="1"
      color="primary"
      label
    />
    <span class="text-caption vol-val">{{ vol }}</span>
  </div>

  <!-- popup: 푸터 아이콘 버튼 + 세로 슬라이더 -->
  <q-btn v-else flat round :icon="volIcon" color="primary">
    <DelayedTooltip :msg="$t('controls.footerVolume.masterVolume')" />
    <q-menu anchor="top middle" self="bottom middle">
      <div class="column items-center q-pa-md master-vol-pop">
        <q-slider
          :model-value="vol"
          @update:model-value="onDrag"
          @change="onChange"
          :min="0"
          :max="100"
          :step="1"
          vertical
          reverse
          color="primary"
          style="height: 120px"
        />
        <div class="text-caption text-muted q-mt-sm vol-val">{{ vol }}</div>
      </div>
    </q-menu>
  </q-btn>
</template>

<style scoped>
.master-vol-pop {
  min-width: 56px;
}
.vol-val {
  width: 2.5rem;
  text-align: center;
}
</style>
