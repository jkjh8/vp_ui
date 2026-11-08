<script setup>
import { useDialogPluginComponent } from 'quasar'
import { ref, onMounted, computed } from 'vue'
import { useFilesStore } from 'src/stores/useFiles'
import { useApiStore } from 'src/stores/useApi'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const { t } = useI18n()

const props = defineProps({
  playlist: {
    type: Object,
    required: true,
  },
  // mimetype 접두 필터. 문자열 1개('audio/') 또는 배열(['video/','image/'])로 여러 접두 허용.
  // 예: 음원 추가='audio/', 영상 추가=['video/','image/'] (영상+이미지만).
  mimeFilter: {
    type: [String, Array],
    default: '',
  },
  // 단일 선택 모드 (영상 클립 지정/교체용) — 체크박스 없이 클릭으로 하나만 선택.
  single: {
    type: Boolean,
    default: false,
  },
})

const tracks = ref([])
const { getAddr } = useApiStore()
const { files, folders } = storeToRefs(useFilesStore())

// 폴더/이름 검색 필터
const folderId = ref(null) // null = 전체 폴더
const search = ref('')

// 폴더 선택 옵션 (null = 전체 파일 — 모든 폴더의 파일 표시)
const folderOptions = computed(() => [
  { label: t('dialogs.addTracks.allFiles'), value: null },
  ...[...folders.value]
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'ko'))
    .map((f) => ({ label: f.name, value: f._id })),
])

// 허용 mimetype 접두 목록 (문자열 1개도 배열로 정규화). 비어있으면 필터 없음(전체).
const mimePrefixes = computed(() => {
  const f = props.mimeFilter
  return (Array.isArray(f) ? f : [f]).filter(Boolean)
})

const filteredFiles = computed(() => {
  let list = files.value || []
  if (mimePrefixes.value.length)
    list = list.filter((f) => mimePrefixes.value.some((p) => (f.mimetype || '').startsWith(p)))
  if (folderId.value !== null) list = list.filter((f) => (f.folderId ?? null) === folderId.value)
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((f) => (f.filename || '').toLowerCase().includes(q))
  return list
})

onMounted(async () => {
  await Promise.all([useFilesStore().getFileList(), useFilesStore().getFolders()])
})

// 현재 보이는(필터된) 파일이 모두 선택되었는지 — 폴더/검색을 오가도 선택은 누적된다.
const allSelected = computed({
  get() {
    return (
      filteredFiles.value.length > 0 && filteredFiles.value.every((f) => tracks.value.includes(f))
    )
  },
  set(val) {
    toggleAll(val)
  },
})

function toggleAll(val) {
  if (val) {
    const set = new Set(tracks.value)
    filteredFiles.value.forEach((f) => set.add(f))
    tracks.value = [...set]
  } else {
    tracks.value = tracks.value.filter((f) => !filteredFiles.value.includes(f))
  }
}

function toggleTrack(file, checked) {
  const idx = tracks.value.indexOf(file)
  if (typeof checked === 'boolean') {
    if (checked && idx === -1) tracks.value.push(file)
    else if (!checked && idx !== -1) tracks.value.splice(idx, 1)
  } else {
    if (idx === -1) tracks.value.push(file)
    else tracks.value.splice(idx, 1)
  }
}

// 행 클릭: 단일 모드면 그 파일 하나만 선택(교체), 아니면 토글.
function selectRow(file) {
  if (props.single) tracks.value = [file]
  else toggleTrack(file)
}
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="dialog-card">
      <q-card-section class="row justify-between items-center q-pb-sm">
        <div class="row items-center">
          <q-icon name="playlist_add" size="sm" color="primary"></q-icon>
          <div class="text-h6 q-ml-sm">{{ $t('dialogs.addTracks.title') }}</div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row justify-between items-center">
          <div class="row items-center q-gutter-x-sm">
            <span class="text-caption"> {{ $t('dialogs.addTracks.currentPlaylist') }} </span>
            <span class="text-bold">
              {{ props.playlist?.name || $t('dialogs.addTracks.unknownPlaylist') }}
            </span>
          </div>
          <!-- 전체 선택 체크박스 (단일 모드에선 숨김) -->
          <q-checkbox
            v-if="!single"
            class="q-mr-lg"
            v-model="allSelected"
            @update:model-value="toggleAll"
            :disable="filteredFiles.length === 0"
          />
        </div>

        <!-- 폴더별 필터 + 이름 검색 -->
        <div class="row items-center q-col-gutter-sm q-mb-sm q-mt-xs">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="folderId"
              :options="folderOptions"
              emit-value
              map-options
              dense
              outlined
              options-dense
              :label="$t('dialogs.addTracks.folderLabel')"
            >
              <template v-slot:prepend><q-icon name="folder" /></template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model="search" dense outlined clearable :label="$t('dialogs.addTracks.searchLabel')">
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
        </div>

        <q-list bordered separator class="q-pa-none">
          <q-item
            v-for="(file, index) in filteredFiles"
            :key="index"
            class="q-pa-sm"
            clickable
            :active="tracks.includes(file)"
            active-class="row-selected"
            @click="() => selectRow(file)"
          >
            <q-item-section avatar>
              <q-img
                :src="`${getAddr()}/api/files/thumbnail/${file.uuid}`"
                style="max-width: 50px; max-height: 30px"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ file.filename }}</q-item-label>
              <q-item-label caption>{{ file.mime }}</q-item-label>
            </q-item-section>
            <q-item-section side v-if="!single">
              <q-checkbox
                :model-value="tracks.includes(file)"
                @update:model-value="(checked) => toggleTrack(file, checked)"
                @click.stop
              />
            </q-item-section>
            <q-item-section side v-else-if="tracks.includes(file)">
              <q-icon name="check_circle" color="primary" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat round color="negative" icon="cancel" @click="onDialogCancel" />
        <q-btn flat round color="primary" icon="check_circle" @click="onDialogOK(tracks)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: var(--radius-lg);
  background-color: var(--surface-1);
  min-width: 350px;
  max-width: 600px;
  width: 50%;
}
.q-list {
  max-height: 400px;
  overflow-y: auto;
}
.row-selected {
  background-color: var(--accent-weak, rgba(25, 118, 210, 0.12));
  color: var(--accent, #1976d2);
}
</style>
