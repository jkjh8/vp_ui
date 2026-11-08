<script setup>
// 진행 슬라이더 — usePlayback 파사드 경유. 재생 모드별 표시 기준:
//  • 씬 모드   : 장면의 "가장 긴 미디어" 기준(창들의 max 재생시간/메타데이터).
//  • 윈도우 모드: 상단 탭에서 선택한 창의 재생시간. 시크도 그 창만 대상.
//  • 단일/레거시: pStatus.player.
import { ref, computed, watch } from 'vue'
import { usePlayback } from 'src/composables/usePlayback'
import { msToHMS } from 'src/composables/useTime'

const { pStatus, windowStates, activeWinIds, isWindowMode, selectedWindow, seek, winName } =
  usePlayback()

const props = defineProps({
  time: { type: Boolean, default: true }, // 우측 시간 텍스트 표시 여부
})

const slideTime = ref(0)
const start = ref(false)

const isPlaylist = computed(() => !!pStatus.value.playlistMode)
const isSceneMode = computed(
  () => isPlaylist.value && !isWindowMode.value && activeWinIds.value.length > 0,
)

// 윈도우 모드: 활성 창이 바뀌면 유효한 창으로 자동 보정.
watch(
  activeWinIds,
  (ids) => {
    if (!ids.length) {
      selectedWindow.value = null
      return
    }
    if (selectedWindow.value == null || !ids.includes(selectedWindow.value))
      selectedWindow.value = ids[0]
  },
  { immediate: true },
)

// 현재 장면(트랙)의 클립들 — 씬 모드 duration(가장 긴 미디어) 계산 근거.
const sceneClips = computed(() => {
  const trk = pStatus.value.playlist?.tracks?.[pStatus.value.trackId]
  return Array.isArray(trk?.clips) ? trk.clips : []
})
const clipDurMs = (clip) => {
  if (!clip) return 0
  if (clip.is_image) return (clip.time || 5) * 1000
  const d = parseFloat(clip?.metadata?.format?.duration)
  return Number.isFinite(d) && d > 0 ? d * 1000 : 0
}

// 표시할 { time, duration, is_image } (ms 단위).
const current = computed(() => {
  if (isSceneMode.value) {
    let dur = 0
    for (const c of sceneClips.value) dur = Math.max(dur, clipDurMs(c))
    let time = 0
    for (const id of activeWinIds.value) {
      const p = windowStates.value[id]?.player || {}
      if (Number.isFinite(p.duration)) dur = Math.max(dur, p.duration)
      if (Number.isFinite(p.time)) time = Math.max(time, p.time)
    }
    return {
      time,
      duration: dur,
      is_image: sceneClips.value.length > 0 && sceneClips.value.every((c) => c.is_image),
    }
  }
  if (isWindowMode.value && selectedWindow.value != null) {
    const p = windowStates.value[selectedWindow.value]?.player || {}
    return { time: p.time || 0, duration: p.duration || 0, is_image: false }
  }
  const p = pStatus.value.player || { time: 0, duration: 0 }
  return {
    time: p.time || 0,
    duration: p.duration || 0,
    is_image: pStatus.value.file?.is_image ?? false,
  }
})

const isImage = computed(() => current.value?.is_image ?? false)
const seekDisabled = computed(() => isImage.value || (current.value.duration || 0) <= 0)

const doSeek = (t) => {
  if (isWindowMode.value && selectedWindow.value != null) seek(t, selectedWindow.value)
  else seek(t)
}
const updateTimeFromSlide = (t) => {
  slideTime.value = t
  if (!start.value && !isImage.value) doSeek(slideTime.value)
}
const panning = (e) => {
  try {
    if (isImage.value) return
    if (e === 'start') start.value = true
    else if (e === 'end') {
      start.value = false
      doSeek(slideTime.value)
    }
  } catch (error) {
    console.error('Error during panning:', error)
  }
}
</script>

<template>
  <div class="column q-px-md q-pt-none q-mt-none">
    <!-- 윈도우 모드: 창 선택 탭 -->
    <q-tabs
      v-if="isWindowMode && activeWinIds.length"
      :model-value="selectedWindow"
      @update:model-value="selectedWindow = $event"
      dense
      no-caps
      inline-label
      align="left"
      active-color="primary"
      indicator-color="primary"
      class="win-tabs"
    >
      <q-tab v-for="id in activeWinIds" :key="id" :name="id" :label="winName(id)" icon="tv" />
    </q-tabs>

    <div class="row no-wrap q-gutter-x-sm items-center">
      <q-slider
        class="q-mt-none q-pt-none col"
        :model-value="(current.time || 0) / 1000"
        :min="0"
        :step="0.01"
        :max="(current.duration || 0) / 1000"
        label
        :label-value="msToHMS((current.time || 0) / 1000)"
        @update:model-value="updateTimeFromSlide"
        @pan="panning"
        :disable="seekDisabled"
      />
      <div v-if="props.time" class="gt-xs text-caption text-no-wrap">
        {{ msToHMS((current.time || 0) / 1000) }}/{{ msToHMS((current.duration || 0) / 1000) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.win-tabs {
  min-height: 30px;
}
</style>
