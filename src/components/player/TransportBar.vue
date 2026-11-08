<script setup>
// 트랜스포트 바 — 전 페이지 유일한 재생 제어 표면.
// variant='compact': 푸터(상시). variant='expanded': 홈 컨트롤 센터(큰 썸네일 + 큰 버튼).
// 윈도우 모드: 재생/일시정지/정지/Next/Prev는 "선택된 창"(TimeSlider 상단 탭)만 제어,
//             stop_circle(전체 정지)로 전 창 일괄 정지. 씬 모드: 전 창 락스텝(전역).
// 창별 개별 시작/정지는 StagePreview(스테이지)에서 담당 — 여기서는 선택/전역만.
import { computed } from 'vue'
import DelayedTooltip from 'src/components/DelayedTooltip.vue'
import TimeSlider from './TimeSlider.vue'
import MasterVolume from './MasterVolume.vue'
import { usePlayback } from 'src/composables/usePlayback'
import { useApiStore } from 'src/stores/useApi'

const props = defineProps({
  variant: { type: String, default: 'compact' }, // 'compact' | 'expanded'
})

const {
  pStatus,
  isWindowMode,
  isPlaying,
  play,
  pause,
  stop,
  stopAll,
  prev,
  next,
  currentRepeat,
  toggleRepeat,
  selectedWindow,
  winName,
} = usePlayback()
const { getAddr } = useApiStore()

const expanded = computed(() => props.variant === 'expanded')
const btnSize = computed(() => (expanded.value ? 'lg' : 'md'))

// ── 미디어 라벨: 장면 이름 > 창1 파일명 > 대표 파일명 ──
const win1State = computed(() => {
  const ws = pStatus.value.windowStates || {}
  if (ws[1]) return ws[1]
  const ids = Object.keys(ws)
    .map(Number)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
  return ids.length ? ws[ids[0]] : null
})
const currentScene = computed(() => {
  const tracks = pStatus.value.playlist?.tracks
  if (!Array.isArray(tracks)) return null
  const st = win1State.value
  let idx = st && Number.isInteger(st.sceneIndex) ? st.sceneIndex : null
  if (idx == null && Number.isInteger(pStatus.value.trackId)) idx = pStatus.value.trackId
  return idx != null ? tracks[idx] : null
})
const sceneName = computed(() => {
  const n = currentScene.value?.name
  return typeof n === 'string' ? n.trim() : ''
})
const mediaLabel = computed(
  () => sceneName.value || win1State.value?.filename || pStatus.value.file?.filename || '',
)
const mediaIcon = computed(() => {
  if (sceneName.value) return 'theaters'
  return pStatus.value.file?.is_image ? 'image' : 'video_library'
})
const thumbUuid = computed(() => pStatus.value.file?.uuid || null)

// 윈도우 모드: 선택 창 기준 반복(currentRepeat). 그 외: 전역. 버튼도 선택 창만 토글.
const repeat = computed(() => currentRepeat.value || 'none')
const rotateRepeat = () => toggleRepeat()
// 윈도우 모드일 때 반복 버튼이 "어느 창"을 제어하는지 툴팁에 표시.
const repeatScopeLabel = computed(() =>
  isWindowMode.value && selectedWindow.value != null ? winName(selectedWindow.value) : '',
)
</script>

<template>
  <div class="transport" :class="expanded ? 'transport--expanded' : 'transport--compact'">
    <TimeSlider :time="true" />

    <!-- 미디어 라벨 -->
    <div class="row no-wrap justify-center items-center q-mt-xs">
      <div v-if="mediaLabel" class="row items-center q-gutter-x-sm">
        <q-icon :name="mediaIcon" size="sm" color="primary" />
        <span class="text-bold ellipsis media-label">{{ mediaLabel }}</span>
      </div>
      <div v-else class="text-faint">{{ $t('controls.mediaName.noMediaSelected') }}</div>
    </div>

    <!-- 버튼 행 -->
    <div class="row no-wrap justify-center items-center q-gutter-x-md q-mt-xs">
      <!-- expanded: 썸네일 -->
      <q-img
        v-if="expanded && thumbUuid"
        :src="`${getAddr()}/api/files/thumbnail/${thumbUuid}`"
        class="thumb mini-thumb"
        alt="thumbnail"
      />

      <!-- 홈(expanded)은 우측 카드에 인라인 볼륨이 있으므로 중복 표시하지 않음 -->
      <MasterVolume v-if="!expanded" variant="popup" />

      <q-btn flat round :size="btnSize" icon="skip_previous" color="primary" @click="prev">
        <DelayedTooltip :msg="$t('common.prev')" />
      </q-btn>

      <q-btn
        v-if="!isPlaying"
        flat
        round
        :size="btnSize"
        icon="play_arrow"
        color="primary"
        @click="play()"
      >
        <DelayedTooltip
          :msg="isWindowMode ? $t('controls.controlBtns.playSelected') : $t('common.play')"
        />
      </q-btn>
      <q-btn v-else flat round :size="btnSize" icon="pause" color="primary" @click="pause">
        <DelayedTooltip
          :msg="isWindowMode ? $t('controls.controlBtns.pauseSelected') : $t('common.pause')"
        />
      </q-btn>

      <q-btn flat round :size="btnSize" icon="stop" color="negative" @click="stop()">
        <DelayedTooltip
          :msg="isWindowMode ? $t('controls.controlBtns.stopSelected') : $t('common.stop')"
        />
      </q-btn>

      <q-btn
        v-if="isWindowMode"
        flat
        round
        :size="btnSize"
        icon="stop_circle"
        color="negative"
        @click="stopAll"
      >
        <DelayedTooltip :msg="$t('controls.controlBtns.stopAll')" />
      </q-btn>

      <q-btn flat round :size="btnSize" icon="skip_next" color="primary" @click="next">
        <DelayedTooltip :msg="$t('common.next')" />
      </q-btn>

      <q-btn
        flat
        round
        :size="btnSize"
        :icon="repeat === 'repeat_one' ? 'repeat_one' : 'repeat'"
        :color="repeat === 'none' ? 'grey-5' : 'primary'"
        @click="rotateRepeat"
      >
        <DelayedTooltip
          :msg="
            (repeatScopeLabel ? repeatScopeLabel + ' · ' : '') +
            (repeat === 'all'
              ? $t('controls.controlBtns.repeatAll')
              : repeat === 'repeat_one'
                ? $t('controls.controlBtns.repeatOne')
                : $t('controls.controlBtns.repeatNone'))
          "
        />
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
.transport--compact {
  padding: 4px 0 8px;
}
.transport--expanded {
  padding: 8px 0 12px;
}
.media-label {
  max-width: 60vw;
}
.mini-thumb {
  width: 96px;
  height: 54px;
  box-shadow: var(--shadow-2);
  flex: 0 0 auto;
}
</style>
