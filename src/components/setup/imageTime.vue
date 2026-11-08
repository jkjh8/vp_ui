<script setup>
import SettingRow from 'src/components/ui/SettingRow.vue'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'

const { updateImageTime } = useStatusStore()
const { pStatus } = storeToRefs(useStatusStore())
const updateValue = async (value) => {
  await updateImageTime(value)
}
</script>

<template>
  <SettingRow icon="timer" :label="$t('setup.imageTime.title')">
    <template #control>
      <q-btn
        flat
        round
        size="sm"
        icon="chevron_left"
        @click="updateValue(Math.max(1, (Number(pStatus.imageTime) || 5) - 1))"
      />
      <span class="text-bold time-val">
        {{ pStatus.imageTime }}<span class="text-caption q-ml-xs">{{ $t('setup.imageTime.sec') }}</span>
      </span>
      <q-btn
        flat
        round
        size="sm"
        icon="chevron_right"
        @click="updateValue(Math.min(60, (Number(pStatus.imageTime) || 5) + 1))"
      />
    </template>
  </SettingRow>
</template>

<style scoped>
.time-val {
  min-width: 48px;
  text-align: center;
}
</style>
