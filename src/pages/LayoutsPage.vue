<script setup>
// 화면 구성(출력 창 배치) 프리셋 페이지 — 현재 배치를 이름 붙여 저장하고, 목록에서 적용/덮어쓰기/
// 이름변경/삭제한다. 목록은 pStatus.windowPresets(소켓)로 실시간 반영, 액션은 usePresets 스토어.
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useStatusStore } from 'src/stores/useStatus'
import { usePresetsStore } from 'src/stores/usePresets'
import WindowsManager from 'src/components/setup/WindowsManager.vue'
import DelayedTooltip from 'src/components/DelayedTooltip.vue'
import PageHeader from 'src/components/ui/PageHeader.vue'
import InfoHint from 'src/components/ui/InfoHint.vue'

const { t } = useI18n()
const $q = useQuasar()
const { pStatus } = storeToRefs(useStatusStore())
const presetsStore = usePresetsStore()

const presets = computed(() => pStatus.value.windowPresets || [])
const currentWindows = computed(() => pStatus.value.windows || [])
const activePresetId = computed(() => pStatus.value.activePresetId ?? null)

// 드롭다운 선택 프리셋 (기본 = 현재 활성 프리셋). 목록 변경 시 유효성 유지.
const selectedPresetId = ref(null)
const presetOptions = computed(() =>
  presets.value.map((p) => ({
    label: p.name + (p.id === activePresetId.value ? ` · ${t('layouts.current')}` : ''),
    value: p.id,
  })),
)
const selectedPreset = computed(() => presets.value.find((p) => p.id === selectedPresetId.value) || null)
watch(
  [presets, activePresetId],
  () => {
    if (!presets.value.some((p) => p.id === selectedPresetId.value)) {
      selectedPresetId.value = activePresetId.value ?? presets.value[0]?.id ?? null
    }
  },
  { immediate: true },
)

// 현재 배치를 새 프리셋으로 저장 (이름 프롬프트)
const onSaveCurrent = () => {
  if (!currentWindows.value.length) {
    $q.notify({ type: 'warning', message: t('layouts.noCurrentWindows') })
    return
  }
  $q.dialog({
    title: t('layouts.savePromptTitle'),
    message: t('layouts.savePromptMessage'),
    prompt: { model: '', type: 'text', label: t('layouts.nameLabel') },
    cancel: true,
    persistent: false,
  }).onOk((name) => presetsStore.savePreset(name))
}

const onApply = (p) => {
  $q.dialog({
    title: t('layouts.applyConfirmTitle'),
    message: t('layouts.applyConfirmMessage', { name: p.name }),
    cancel: true,
    persistent: false,
  }).onOk(() => presetsStore.applyPreset(p.id))
}

const onOverwrite = (p) => {
  $q.dialog({
    title: t('layouts.overwriteConfirmTitle'),
    message: t('layouts.overwriteConfirmMessage', { name: p.name }),
    cancel: true,
    persistent: false,
  }).onOk(() => presetsStore.updatePreset(p.id))
}

const onRename = (p) => {
  $q.dialog({
    title: t('layouts.renamePromptTitle'),
    prompt: { model: p.name, type: 'text', label: t('layouts.nameLabel') },
    cancel: true,
    persistent: false,
  }).onOk((name) => presetsStore.renamePreset(p.id, name))
}

const onDelete = (p) => {
  $q.dialog({
    title: t('layouts.deleteConfirmTitle'),
    message: t('layouts.deleteConfirmMessage', { name: p.name }),
    cancel: true,
    persistent: false,
  }).onOk(() => presetsStore.deletePreset(p.id))
}
</script>

<template>
  <q-page padding>
    <div class="layouts-wrap">
      <PageHeader icon="space_dashboard" :title="$t('layouts.title')">
        <template #actions>
          <InfoHint :msg="$t('layouts.description')" size="20px" />
        </template>
      </PageHeader>

      <!-- 상단: 프리셋 (드롭다운 선택 → 불러오기/관리) -->
      <div class="row items-center q-gutter-sm q-mb-lg">
        <q-icon name="bookmarks" size="sm" color="primary" />
        <span class="text-bold q-mr-sm">{{ $t('layouts.presetsTitle') }}</span>
        <q-select
          v-if="presets.length"
          v-model="selectedPresetId"
          :options="presetOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          dense
          outlined
          options-dense
          style="min-width: 240px"
        />
        <span v-else class="text-caption text-muted">{{ $t('layouts.noPresets') }}</span>
        <template v-if="selectedPreset">
          <q-btn round flat dense color="primary" icon="play_arrow" @click="onApply(selectedPreset)">
            <DelayedTooltip :msg="$t('layouts.apply')" />
          </q-btn>
          <q-btn dense flat round color="grey-7" icon="save" @click="onOverwrite(selectedPreset)">
            <DelayedTooltip :msg="$t('layouts.overwrite')" />
          </q-btn>
          <q-btn dense flat round color="grey-7" icon="edit" @click="onRename(selectedPreset)">
            <DelayedTooltip :msg="$t('layouts.rename')" />
          </q-btn>
          <q-btn dense flat round color="grey-7" icon="delete" @click="onDelete(selectedPreset)">
            <DelayedTooltip :msg="$t('common.delete')" />
          </q-btn>
        </template>
        <q-space />
        <q-btn round flat dense color="primary" icon="add" @click="onSaveCurrent">
          <DelayedTooltip :msg="$t('layouts.addPreset')" />
        </q-btn>
      </div>

      <!-- 출력 창 배치/편집 (좌 캔버스 / 우 편집) -->
      <q-card flat bordered class="q-pa-md card">
        <WindowsManager canvas-auto-height :canvas-height="360" />
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.layouts-wrap {
  max-width: 1600px;
  margin: 0 auto;
}
.card {
  background: var(--surface-1);
  border-radius: var(--radius-md);
}
</style>
