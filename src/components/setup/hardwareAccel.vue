<script setup>
// 하드웨어 가속은 무조건 우선 적용(호스트가 VP_HWACCEL=1로 고정) — 사용자 토글 없음.
// 이 컴포넌트는 현재 시스템이 GPU 하드웨어 가속을 지원하는지 "표시만" 한다.
// 판정 근거: hwaccel_status 실효값(hardwareAccelEffective) — 'hardware'/'software'.
import { computed } from 'vue'
import SettingRow from 'src/components/ui/SettingRow.vue'
import InfoHint from 'src/components/ui/InfoHint.vue'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { pStatus } = storeToRefs(useStatusStore())

const support = computed(() => {
  const eff = pStatus.value.hardwareAccelEffective
  if (eff === 'hardware')
    return { label: t('setup.hardwareAccel.supported'), color: 'positive', icon: 'check_circle' }
  if (eff === 'software')
    return { label: t('setup.hardwareAccel.notSupported'), color: 'warning', icon: 'warning' }
  return { label: t('setup.hardwareAccel.checking'), color: 'grey', icon: 'hourglass_empty' }
})
</script>

<template>
  <SettingRow icon="memory" :label="$t('setup.hardwareAccel.title')">
    <template #control>
      <InfoHint :msg="$t('setup.hardwareAccel.autoUse')" />
      <q-chip :color="support.color" text-color="white" :icon="support.icon" dense>
        {{ support.label }}
      </q-chip>
    </template>
  </SettingRow>
</template>

<style scoped></style>
