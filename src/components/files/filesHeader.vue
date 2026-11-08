<script setup>
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import UploadFiles from '../dialogs/updateFiles.vue'
import FolderDialog from '../dialogs/folderDialog.vue'
import PageHeader from '../ui/PageHeader.vue'
import DelayedTooltip from '../DelayedTooltip.vue'
// pinia
import { useFilesStore } from 'src/stores/useFiles'

const { t } = useI18n()
const $q = useQuasar()
const store = useFilesStore()
const { currentFolderId } = storeToRefs(store)

const fnUploadFiles = () => {
  $q.dialog({
    component: UploadFiles,
    componentProps: { folderId: currentFolderId.value },
  }).onOk(() => {
    store.getFileList()
  })
}

const fnNewFolder = () => {
  $q.dialog({ component: FolderDialog, componentProps: { title: t('files.filesHeader.newFolder') } }).onOk(async (name) => {
    try {
      // 현재 선택된 폴더 아래에 생성 (루트면 최상위)
      await store.createFolder(name, currentFolderId.value)
    } catch (e) {
      $q.notify({
        type: 'negative',
        position: 'top',
        message: e?.response?.data?.error || t('files.filesHeader.createFolderFailed'),
      })
    }
  })
}
</script>

<template>
  <PageHeader icon="folder" :title="$t('files.filesHeader.title')">
    <template #actions>
      <q-btn round flat dense color="grey-7" icon="create_new_folder" @click="fnNewFolder">
        <DelayedTooltip :msg="$t('files.filesHeader.newFolder')" />
      </q-btn>
      <q-btn round flat dense color="primary" icon="add_circle" @click="fnUploadFiles">
        <DelayedTooltip :msg="$t('files.filesHeader.uploadFiles')" />
      </q-btn>
    </template>
  </PageHeader>
</template>

<style scoped></style>
