<script setup>
// 스테이지 프리뷰 — 디스플레이 위 창 배치도(read-only) + 창별 상태/개별 재생·정지.
// 라이브(오퍼레이터) 표면의 중심. 지오메트리 편집은 여기서 하지 않는다(LayoutPage 전용).
// 윈도우형: 창별 재생/정지 컨트롤 노출. 씬형(재생 중): 창별 현재 클립(읽기 전용).
import { computed } from 'vue'
import SectionHeader from 'src/components/ui/SectionHeader.vue'
import WindowChip from 'src/components/ui/WindowChip.vue'
import WindowLayoutCanvas from 'src/components/setup/WindowLayoutCanvas.vue'
import { usePlayback } from 'src/composables/usePlayback'

defineProps({
  height: { type: Number, default: 200 },
  showHeader: { type: Boolean, default: true },
})

const {
  pStatus,
  windows,
  windowStates,
  isWindowMode,
  anyWindowPlaying,
  playWindow,
  stopWindow,
  winName,
  repeatOf,
  setRepeat,
} = usePlayback()

const playlistName = computed(() => pStatus.value.playlist?.name || null)
const winPlaying = (id) => !!windowStates.value[id]
const winFile = (id) => windowStates.value[id]?.filename || ''

// 라이브 입력이 귀속된 창들 (플레이리스트와 무관하게 상시 재생) — 이름 + 연결 상태.
const liveWindows = computed(() =>
  (windows.value || [])
    .filter((w) => w.sourceId)
    .map((w) => ({ id: w.id, name: w.name, state: pStatus.value.sourceStates?.[w.id]?.state || null })),
)
const liveColor = (state) =>
  ({ playing: 'positive', connecting: 'warning', reconnecting: 'warning', error: 'negative' })[state] ||
  'grey'
</script>

<template>
  <div class="app-card stage-card q-pa-md">
    <SectionHeader v-if="showHeader" icon="dashboard" :title="$t('controls.playbackDashboard.title')">
      <template #actions>
        <q-badge
          v-if="anyWindowPlaying"
          color="positive"
          :label="$t('controls.playbackDashboard.playing')"
        />
        <q-badge v-else color="grey" :label="$t('controls.playbackDashboard.stopped')" />
      </template>
    </SectionHeader>

    <div class="row items-center q-gutter-x-sm q-my-sm">
      <q-icon name="queue_music" size="sm" class="text-muted" />
      <span class="text-subtitle2 text-primary">{{
        playlistName || $t('controls.playbackDashboard.none')
      }}</span>
      <span v-if="pStatus.playlistMode && anyWindowPlaying" class="text-caption text-muted">
        {{ $t('controls.playbackDashboard.sceneN', { n: (pStatus.trackId ?? 0) + 1 }) }}
      </span>
    </div>

    <!-- 배치도 (read-only) -->
    <WindowLayoutCanvas :height="height" />

    <!-- 라이브 입력(RTP/RTSP/SRT/NDI)이 귀속된 창 — 플레이리스트와 무관하게 상시 재생 -->
    <div v-if="liveWindows.length" class="row items-center q-gutter-x-xs q-mt-sm">
      <q-icon name="sensors" size="xs" class="text-muted" />
      <q-icon
        v-for="lw in liveWindows"
        :key="lw.id"
        name="circle"
        size="8px"
        :color="liveColor(lw.state)"
      >
        <q-tooltip>{{ lw.name }}</q-tooltip>
      </q-icon>
    </div>

    <!-- 윈도우형: 창별 재생/정지 -->
    <div v-if="isWindowMode && windows.length" class="row q-gutter-sm q-mt-sm">
      <WindowChip
        v-for="w in windows"
        :key="w.id"
        :name="w.name"
        :filename="winFile(w.id)"
        :active="winPlaying(w.id)"
        :repeat="repeatOf(w.id)"
        controls
        @play="playWindow(w.id, 0)"
        @stop="stopWindow(w.id)"
        @repeat="setRepeat(w.id)"
      />
    </div>

    <!-- 씬형(재생 중): 창별 현재 클립 (읽기 전용) -->
    <div v-else-if="anyWindowPlaying" class="row q-gutter-sm q-mt-sm">
      <WindowChip
        v-for="(st, id) in windowStates"
        :key="id"
        :name="winName(id)"
        :filename="st.filename || st.uuid || ''"
        :active="true"
      />
    </div>
  </div>
</template>

<style scoped>
.stage-card {
  width: 100%;
}
</style>
