<script setup>
// 오디오 소스 1개(영상 내장 오디오 또는 추가 오디오)의 채널별 볼륨/뮤트/출력/지연 설정 팝업.
// 트랙 편집 팝업(trackEditor)에서 연다. 채널 표는 SceneAudioList를 소스 1개짜리 장면으로 재사용하며,
// 저장 전 편집이라 라이브 적용은 하지 않는다. 반환(onOk): 설정이 반영된 소스 객체.
import { useDialogPluginComponent } from 'quasar'
import { ref, computed } from 'vue'
import SceneAudioList from '../playlists/SceneAudioList.vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  source: { type: Object, required: true },
  // 'embedded' = 영상 클립의 내장 오디오, 'extra' = 추가 오디오
  kind: { type: String, default: 'extra' },
  // 추가 오디오가 귀속된 창 (윈도우 모드 레인). null = 전역 디바이스
  audioWindow: { type: Number, default: null },
})

const local = ref({ ...props.source })
const scene = computed(() =>
  props.kind === 'embedded'
    ? { clips: [local.value], audios: [] }
    : { clips: [], audios: [local.value] },
)
const patchClip = (_win, patch) => {
  local.value = { ...local.value, ...patch }
}
const patchAudios = (next) => {
  if (next?.[0]) local.value = { ...next[0] }
}
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="dialog-card">
      <q-card-section class="row items-center no-wrap q-pb-sm">
        <q-icon name="tune" size="sm" color="grey-7" />
        <div class="q-ml-sm" style="min-width: 0">
          <div class="text-h6">{{ $t('dialogs.audioChannels.title') }}</div>
          <div class="text-caption text-muted ellipsis">{{ local.filename }}</div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="settings-box">
          <SceneAudioList
            :scene="scene"
            :scene-idx="0"
            :on-patch-clip="patchClip"
            :on-patch-audios="patchAudios"
            :audio-window="props.audioWindow"
            :live="false"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps :label="$t('common.cancel')" color="grey-7" @click="onDialogCancel" />
        <q-btn unelevated no-caps color="primary" :label="$t('dialogs.audioChannels.apply')" @click="onDialogOK(local)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: var(--radius-lg);
  background-color: var(--surface-1);
  min-width: 360px;
  max-width: 640px;
  width: 50%;
}
.settings-box {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-0);
  max-height: 420px;
  overflow-y: auto;
}
</style>
