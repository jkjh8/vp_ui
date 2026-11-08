<script setup>
// 파일 웹 미리보기 다이얼로그 — 플레이어 출력이 아닌 브라우저 내에서 재생/표시.
// 비디오/오디오는 <video>/<audio>, 이미지는 <img>. 원본은 /api/files/raw/:uuid (range 지원).
import { computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useApiStore } from 'src/stores/useApi'

const props = defineProps({
  file: { type: Object, required: true },
})
const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent()
const { getAddr } = useApiStore()

const src = computed(() => `${getAddr()}/api/files/raw/${props.file.uuid}`)
const mime = computed(() => props.file.mimetype || '')
const kind = computed(() => {
  if (mime.value.startsWith('video/')) return 'video'
  if (mime.value.startsWith('audio/')) return 'audio'
  if (mime.value.startsWith('image/')) return 'image'
  return 'other'
})
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="preview-card">
      <q-card-section class="row items-center q-pb-sm">
        <q-icon name="visibility" color="primary" size="sm" />
        <div class="text-subtitle1 q-ml-sm ellipsis">{{ file.filename }}</div>
        <q-space />
        <q-btn dense flat round icon="close" @click="onDialogCancel" />
      </q-card-section>
      <q-card-section class="q-pt-none preview-body">
        <video
          v-if="kind === 'video'"
          :src="src"
          controls
          autoplay
          class="preview-media"
        />
        <audio v-else-if="kind === 'audio'" :src="src" controls autoplay class="full-w" />
        <img v-else-if="kind === 'image'" :src="src" class="preview-media" :alt="file.filename" />
        <div v-else class="text-muted q-pa-md">{{ $t('dialogs.filePreview.unsupported') }}</div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.preview-card {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  width: 80vw;
  max-width: 900px;
}
.preview-body {
  display: flex;
  justify-content: center;
  align-items: center;
}
.preview-media {
  max-width: 100%;
  max-height: 70vh;
  border-radius: var(--radius-md);
  background: #000;
}
.full-w {
  width: 100%;
}
</style>
