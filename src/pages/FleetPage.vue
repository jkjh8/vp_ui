<script setup>
// 멀티 PC 마스터 콘솔 페이지 — 발견된 플레이어 목록 + 쇼 빌더 + 플레이어 원격 관리 다이얼로그.
// role=master 일 때만 드로어에 노출된다(AppDrawer). standalone/slave가 직접 접근하면 안내만 표시.
import { ref, onMounted } from 'vue'
import { useFleet } from 'src/composables/useFleet'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import FleetList from 'src/components/fleet/FleetList.vue'
import ShowBuilder from 'src/components/fleet/ShowBuilder.vue'
import SyncDiag from 'src/components/fleet/SyncDiag.vue'
import PlayerConsole from 'src/components/fleet/PlayerConsole.vue'
import PageHeader from 'src/components/ui/PageHeader.vue'
import InfoHint from 'src/components/ui/InfoHint.vue'
import DelayedTooltip from 'src/components/DelayedTooltip.vue'

const { t } = useI18n()
const $q = useQuasar()
const fleet = useFleet()
const { players, isMaster } = fleet

const consolePlayer = ref(null)
const onManage = (p) => {
  consolePlayer.value = p
}

const refresh = async () => {
  try {
    await fleet.refresh()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  }
}
onMounted(() => {
  if (isMaster.value) refresh()
})
</script>

<template>
  <q-page padding>
    <PageHeader icon="devices" :title="t('fleet.title')">
      <template #actions>
        <InfoHint :msg="t('fleet.subtitle')" size="20px" />
        <q-btn dense flat round color="grey-7" icon="refresh" @click="refresh">
          <DelayedTooltip :msg="t('fleet.refresh')" />
        </q-btn>
      </template>
    </PageHeader>

    <div v-if="!isMaster" class="text-muted q-pa-md">{{ t('fleet.notMaster') }}</div>
    <template v-else>
      <FleetList :players="players" @manage="onManage" />
      <ShowBuilder class="q-mt-lg" />
      <SyncDiag class="q-mt-lg" />
      <PlayerConsole v-if="consolePlayer" :player="consolePlayer" @close="consolePlayer = null" />
    </template>
  </q-page>
</template>
