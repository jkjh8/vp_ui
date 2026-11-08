<script setup>
// 전 트랙 프리롤 설정 (lookahead/max_decks) — Layouts 페이지의 독립 카드.
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStatusStore } from 'src/stores/useStatus'
import { useApiStore } from 'src/stores/useApi'
import { useI18n } from 'vue-i18n'
import DelayedTooltip from '../DelayedTooltip.vue'
import InfoHint from 'src/components/ui/InfoHint.vue'

const { t } = useI18n()
const { pStatus } = storeToRefs(useStatusStore())
const { apiCallWithLoading } = useApiStore()

const lookahead = ref(pStatus.value.preloadLookahead ?? 2)
const maxDecks = ref(pStatus.value.preloadMaxDecks ?? 8)
const savePreload = () =>
  apiCallWithLoading(
    `/player/preload`,
    'PUT',
    { lookahead: Number(lookahead.value), maxDecks: Number(maxDecks.value) },
    t('setup.windows.preloadApplying'),
  )
</script>

<template>
  <div>
    <div class="row items-center q-gutter-sm">
      <q-input
        style="width: 160px"
        v-model.number="lookahead"
        type="number"
        min="0"
        max="32"
        dense
        outlined
        :label="$t('setup.windows.lookahead')"
      />
      <q-input
        style="width: 160px"
        v-model.number="maxDecks"
        type="number"
        min="1"
        max="64"
        dense
        outlined
        :label="$t('setup.windows.maxDecks')"
      />
      <q-btn dense flat round color="grey-7" icon="save" @click="savePreload">
        <DelayedTooltip :msg="$t('common.apply')" />
      </q-btn>
      <InfoHint :msg="$t('setup.windows.prerollDesc')" />
    </div>
  </div>
</template>
