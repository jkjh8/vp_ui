<script setup>
// 자동 발견된 플레이어 카드 그리드 — 이름/주소/온라인·오프라인/역할/PTP/현재재생 + 관리 버튼.
import { useI18n } from 'vue-i18n'

defineProps({ players: { type: Array, default: () => [] } })
const emit = defineEmits(['manage'])
const { t } = useI18n()

const ptpColor = (p) => (p.ptp?.synced ? 'positive' : p.ptp?.enabled ? 'warning' : 'grey')
const ptpLabel = (p) =>
  p.ptp?.synced ? t('fleet.ptpSynced') : p.ptp?.enabled ? t('fleet.ptpWaiting') : t('fleet.ptpOff')
</script>

<template>
  <div>
    <div v-if="!players.length" class="text-muted q-pa-md">{{ t('fleet.noPlayers') }}</div>
    <div class="row q-col-gutter-md">
      <div v-for="p in players" :key="p.id" class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="q-pa-md" :class="{ 'fleet-offline': !p.online }">
          <div class="row items-center q-mb-xs">
            <q-icon name="desktop_windows" size="sm" class="q-mr-sm" />
            <span class="text-bold ellipsis">{{ p.name }}</span>
            <q-space />
            <q-badge
              :color="p.online ? 'positive' : 'grey'"
              :label="p.online ? t('fleet.online') : t('fleet.offline')"
            />
          </div>
          <div class="text-caption text-muted">{{ p.ip }}:{{ p.restPort }}</div>
          <div class="row items-center q-gutter-xs q-mt-sm">
            <q-badge outline color="primary" :label="p.role" />
            <q-badge :color="ptpColor(p)" :label="`PTP ${ptpLabel(p)}`" />
          </div>
          <div class="text-caption q-mt-sm ellipsis">
            {{ t('fleet.nowPlaying') }}:
            {{ p.playing?.isPlaying ? p.playing?.playlistName || '—' : t('fleet.idle') }}
          </div>
          <div class="row justify-end q-mt-sm">
            <q-btn
              dense
              flat
              color="primary"
              icon="tune"
              :label="t('fleet.manage')"
              :disable="!p.online"
              @click="emit('manage', p)"
            />
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fleet-offline {
  opacity: 0.55;
}
</style>
