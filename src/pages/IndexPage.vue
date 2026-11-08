<script setup>
// 홈 = 오퍼레이터 컨트롤 센터 (라이브 표면).
// 스테이지(출력 배치도)를 중심으로, 플레이리스트 런치 + 레이아웃 프리셋 원클릭 리콜 +
// 확장형 트랜스포트 + 마스터 볼륨/프리로드 상태. (오디오 출력 장치는 설정 > 오디오에만 둔다) 지오메트리 편집은 여기서 하지 않는다(LayoutPage 전용).
import { onMounted, computed } from 'vue'
import SectionHeader from 'src/components/ui/SectionHeader.vue'
import PlaylistLauncher from 'src/components/player/PlaylistLauncher.vue'
import StagePreview from 'src/components/player/StagePreview.vue'
import TransportBar from 'src/components/player/TransportBar.vue'
import PreloadBadge from 'src/components/ui/PreloadBadge.vue'
import MasterVolume from 'src/components/player/MasterVolume.vue'
import { usePlayback } from 'src/composables/usePlayback'
import { usePresetsStore } from 'src/stores/usePresets'

const { pStatus, loaded, preloadReady } = usePlayback()

// 멀티 PC 동기 상태 (standalone이 아닐 때만 배지 표시)
const sync = computed(() => pStatus.value.sync || {})
const ptp = computed(() => sync.value.ptp || {})
const showSync = computed(() => sync.value.role && sync.value.role !== 'standalone')
const syncColor = computed(() =>
  ptp.value.synced ? 'positive' : ptp.value.enabled ? 'warning' : 'grey',
)
const presetsStore = usePresetsStore()

const presets = computed(() => pStatus.value.windowPresets || [])
const activePresetId = computed(() => pStatus.value.activePresetId ?? null)
const recall = (id) => presetsStore.applyPreset(id)

onMounted(() => presetsStore.getPresets().catch(() => {}))
</script>

<template>
  <q-page padding>
    <div class="home-wrap">
      <div class="row home-cols">
        <!-- 좌: 스테이지(중심) + 확장형 트랜스포트 -->
        <div class="col-12 col-md-7 column q-gutter-md">
          <StagePreview :height="300" />
          <div class="app-card q-pa-sm">
            <TransportBar variant="expanded" />
          </div>
        </div>

        <!-- 우: 빠른 실행 + 프리셋 리콜 + 상태/헬스 -->
        <div class="col-12 col-md-5 column q-gutter-md">
          <div class="app-card q-pa-md">
            <SectionHeader icon="playlist_play" :title="$t('controls.homePlaylistLaunch.title')">
              <template #actions>
                <q-badge v-if="showSync" :color="syncColor" class="q-mr-xs">
                  <q-icon name="sync" size="12px" class="q-mr-xs" />{{ sync.role }}
                </q-badge>
                <PreloadBadge :loaded="loaded" :ready="preloadReady" />
              </template>
            </SectionHeader>
            <div class="q-mt-sm">
              <PlaylistLauncher />
            </div>

            <template v-if="presets.length">
              <q-separator class="q-my-sm" />
              <div class="row items-center q-gutter-x-sm">
                <q-icon name="bookmarks" size="sm" color="primary" />
                <span class="text-caption text-muted">{{ $t('layouts.presetsTitle') }}</span>
                <div class="row items-center q-gutter-xs">
                  <q-btn
                    v-for="p in presets"
                    :key="p.id"
                    dense
                    no-caps
                    :outline="p.id !== activePresetId"
                    :unelevated="p.id === activePresetId"
                    color="primary"
                    :label="p.name"
                    @click="recall(p.id)"
                  />
                </div>
              </div>
            </template>

            <q-separator class="q-my-sm" />
            <MasterVolume variant="inline" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.home-wrap {
  max-width: 1400px;
  margin: 0 auto;
}
/* 좌우 컬럼 간격 — 기본 gutter보다 조금 더 넓게(36px 가로 / 24px 세로 wrap) */
.home-cols {
  margin-left: -36px;
  margin-top: -24px;
}
.home-cols > [class*='col-'] {
  padding-left: 36px;
  padding-top: 24px;
}
</style>
