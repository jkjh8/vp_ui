<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
// dialog
import MetaData from '../dialogs/metaData.vue'
import DeleteFile from '../dialogs/deleteFile.vue'
import FilePreview from '../dialogs/filePreview.vue'
import MoveToFolder from '../dialogs/moveToFolder.vue'
//pinia
import { useApiStore } from 'src/stores/useApi'
import { useFilesStore } from 'src/stores/useFiles'
// composables
import { firstCharUpperCase, humanReadableFileSize } from 'src/composables/useUtils.js'
import DelayedTooltip from '../DelayedTooltip.vue'

const { t } = useI18n()
const $q = useQuasar()
const store = useFilesStore()
const { filteredFiles, currentFolderId } = storeToRefs(store)
const { getAddr } = useApiStore()

// 다중 선택 (row-key = uuid)
const selected = ref([])

// 웹 미리보기 (플레이어 출력이 아닌 브라우저 내 재생)
const fnPreview = (file) => {
  $q.dialog({ component: FilePreview, componentProps: { file } })
}

// 파일을 다른 폴더로 이동
const fnMove = (file) => {
  $q.dialog({
    component: MoveToFolder,
    componentProps: { currentFolderId: currentFolderId.value, count: 1 },
  }).onOk(async (folderId) => {
    try {
      await store.moveFiles([file.uuid], folderId)
      $q.notify({ type: 'positive', position: 'top', message: t('files.filesList.fileMoved') })
    } catch (e) {
      $q.notify({
        type: 'negative',
        position: 'top',
        message: e?.response?.data?.error || t('files.filesList.moveFailed'),
      })
    }
  })
}

// 선택한 파일들을 다른 폴더로 일괄 이동
const fnMoveSelected = () => {
  const uuids = selected.value.map((f) => f.uuid)
  if (uuids.length === 0) return
  $q.dialog({
    component: MoveToFolder,
    componentProps: { currentFolderId: currentFolderId.value, count: uuids.length },
  }).onOk(async (folderId) => {
    try {
      await store.moveFiles(uuids, folderId)
      $q.notify({
        type: 'positive',
        position: 'top',
        message: t('files.filesList.filesMoved', { count: uuids.length }),
      })
      selected.value = []
    } catch (e) {
      $q.notify({
        type: 'negative',
        position: 'top',
        message: e?.response?.data?.error || t('files.filesList.moveFailed'),
      })
    }
  })
}

// 선택한 파일들을 일괄 삭제
const fnDeleteSelected = () => {
  const uuids = selected.value.map((f) => f.uuid)
  if (uuids.length === 0) return
  $q.dialog({
    component: DeleteFile,
    componentProps: { fileName: t('files.filesList.selectedFiles', { count: uuids.length }) },
  }).onOk(async () => {
    try {
      $q.loading.show({ message: t('files.filesList.deletingFiles', { count: uuids.length }) })
      await store.deleteFiles(uuids)
      $q.notify({
        type: 'positive',
        position: 'top',
        message: t('files.filesList.filesDeleted', { count: uuids.length }),
      })
      selected.value = []
    } catch (e) {
      $q.notify({
        type: 'negative',
        position: 'top',
        message: e?.response?.data?.error || t('files.filesList.deleteFailed'),
      })
    } finally {
      $q.loading.hide()
    }
  })
}

const fnShowMetaData = (file) => {
  $q.dialog({
    component: MetaData,
    componentProps: {
      fieldname: file.fieldname,
      metadata: file.metadata,
    },
  })
}

const fnDeleteFile = (file) => {
  $q.dialog({
    component: DeleteFile,
    componentProps: {
      fileName: file.fieldname,
    },
  })
    .onOk(() => {
      try {
        $q.loading.show({
          message: t('files.filesList.deletingFile', { name: file.fieldname }),
        })
        $q.notify({
          type: 'positive',
          message: t('files.filesList.fileDeleted', { name: file.fieldname }),
        })
        store.deleteFile(file)
        store.getFileList()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: t('files.filesList.fileDeleteError', { name: file.fieldname, error: error.message }),
        })
      } finally {
        $q.loading.hide()
      }
    })
    .onCancel(() => {
      $q.notify({
        type: 'negative',
        message: t('files.filesList.fileDeleteCancelled'),
      })
    })
}
</script>

<template>
  <q-table
    :rows="filteredFiles"
    row-key="uuid"
    selection="multiple"
    v-model:selected="selected"
    :columns="[
      { name: 'name', label: $t('common.name'), field: 'filename', align: 'left', sortable: true },
      { name: 'id', label: $t('files.filesList.colId'), field: 'number', align: 'center', sortable: true },
      { name: 'type', label: $t('files.filesList.colType'), field: 'mimetype', align: 'center', sortable: true },
      { name: 'size', label: $t('files.filesList.colSize'), field: 'size', align: 'center', sortable: true },
      { name: 'actions', label: $t('files.filesList.colActions'), align: 'center' },
    ]"
    :pagination="{
      rowsPerPage: 10,
      page: 1,
      sortBy: 'id',
      descending: false,
    }"
  >
    <!-- 일괄 액션 바: 선택된 항목이 있을 때만 이동/삭제 노출 -->
    <template v-slot:top>
      <template v-if="selected.length">
        <div class="text-subtitle2">{{ $t('files.filesList.selectedCount', { count: selected.length }) }}</div>
        <q-space />
        <q-btn flat dense round icon="drive_file_move" color="primary" class="q-mr-sm" @click="fnMoveSelected">
          <DelayedTooltip :msg="$t('files.filesList.moveToFolder')" />
        </q-btn>
        <q-btn flat dense round icon="delete" color="negative" class="q-mr-sm" @click="fnDeleteSelected">
          <DelayedTooltip :msg="$t('common.delete')" />
        </q-btn>
        <q-btn flat dense round icon="clear" color="grey" @click="selected = []">
          <DelayedTooltip :msg="$t('files.filesList.clearSelection')" />
        </q-btn>
      </template>
      <div v-else class="text-caption text-grey">
        {{ $t('files.filesList.selectHint') }}
      </div>
    </template>
    <!-- 이름 앞에 썸네일 표시: uuid로 요청하고 썸네일 파일을 서버에서 받아와서 표시 -->
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-checkbox v-model="props.selected" />
        </q-td>
        <q-td key="name" :props="props">
          <div class="row no-wrap items-center">
            <div
              style="
                width: 70px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
              "
            >
              <q-img
                v-if="props.row.thumbnail"
                :src="`${getAddr()}/api/files/thumbnail/${props.row.uuid}`"
                style="width: 50px; cursor: pointer"
                :alt="props.row.originalname"
              >
                <q-menu anchor="bottom right" self="top right">
                  <q-img
                    :src="`${getAddr()}/api/files/thumbnail/${props.row.uuid}`"
                    class="thumb"
                    style="width: 200px; max-width: 300px; box-shadow: var(--shadow-2)"
                    :alt="props.row.filename"
                  />
                </q-menu>
              </q-img>
              <q-icon v-else name="play_arrow" size="sm" color="primary" />
            </div>
            <div>
              {{ props.row.filename }}
            </div>
          </div>
        </q-td>
        <q-td key="id" :props="props">{{ props.row.number }}</q-td>
        <q-td key="type" :props="props">{{ firstCharUpperCase(props.row.mimetype) }}</q-td>
        <q-td key="size" :props="props">{{ humanReadableFileSize(props.row.size) }}</q-td>
        <q-td key="actions" :props="props">
          <q-btn round flat dense icon="visibility" color="primary" @click="fnPreview(props.row)">
            <DelayedTooltip :msg="$t('files.filesList.webPreview')" />
          </q-btn>
          <q-btn round flat dense icon="info" color="secondary" @click="fnShowMetaData(props.row)">
            <DelayedTooltip :msg="$t('files.filesList.colType')" />
          </q-btn>
          <q-btn round flat dense icon="drive_file_move" color="primary" @click="fnMove(props.row)">
            <DelayedTooltip :msg="$t('files.filesList.moveToFolder')" />
          </q-btn>
          <q-btn round flat dense icon="download" color="primary" @click="store.downloadFile(props.row)">
            <DelayedTooltip :msg="$t('common.save')" />
          </q-btn>
          <q-btn round flat dense icon="delete" color="negative" @click="fnDeleteFile(props.row)">
            <DelayedTooltip :msg="$t('common.delete')" />
          </q-btn>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<style scoped></style>
