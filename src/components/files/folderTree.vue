<script setup>
// 파일 페이지 좌측 폴더 트리 — 선택으로 필터, 노드별 새 하위폴더/이름변경/삭제.
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useFilesStore } from 'src/stores/useFiles'
import FolderDialog from '../dialogs/folderDialog.vue'
import ConfirmDialog from '../dialogs/confirmDialog.vue'

const { t } = useI18n()
const $q = useQuasar()
const store = useFilesStore()
const { folderTree, currentFolderId, files, folders } = storeToRefs(store)

// q-tree 선택값('root' | 폴더 _id) ↔ store.currentFolderId(null | _id)
const selected = computed({
  get: () => currentFolderId.value ?? 'root',
  set: (v) => store.setCurrentFolder(v),
})

// 폴더별 직접 파일 수
const countByFolder = computed(() => {
  const map = {}
  for (const f of files.value) {
    const key = f.folderId ?? 'root'
    map[key] = (map[key] || 0) + 1
  }
  return map
})

const notifyErr = (e, fallback) =>
  $q.notify({
    type: 'negative',
    position: 'top',
    message: e?.response?.data?.error || fallback,
  })

const newFolder = (node) => {
  const parentId = node.id === 'root' ? null : node.id
  $q.dialog({ component: FolderDialog, componentProps: { title: t('files.folderTree.newFolderTitle') } }).onOk(async (name) => {
    try {
      await store.createFolder(name, parentId)
    } catch (e) {
      notifyErr(e, t('files.folderTree.createFolderFailed'))
    }
  })
}

const renameFolder = (node) => {
  $q.dialog({
    component: FolderDialog,
    componentProps: { title: t('files.folderTree.renameFolderTitle'), initialName: node.label },
  }).onOk(async (name) => {
    try {
      await store.renameFolder(node.id, name)
    } catch (e) {
      notifyErr(e, t('files.folderTree.renameFailed'))
    }
  })
}

// 노드 + 자손 폴더 수 / 포함(직접) 파일 수 계산 → 확인 메시지에 사용
const descendantStats = (nodeId) => {
  const idToChildren = {}
  for (const f of folders.value) {
    const p = f.parentId ?? null
    ;(idToChildren[p] = idToChildren[p] || []).push(f._id)
  }
  const ids = []
  const queue = [nodeId]
  while (queue.length) {
    const cur = queue.shift()
    ids.push(cur)
    queue.push(...(idToChildren[cur] || []))
  }
  const fileCount = files.value.filter((f) => ids.includes(f.folderId)).length
  return { subfolders: ids.length - 1, files: fileCount }
}

const deleteFolder = (node) => {
  const { subfolders, files: fileCount } = descendantStats(node.id)
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: t('files.folderTree.deleteFolderTitle'),
      message: t('files.folderTree.deleteFolderMessage', {
        name: node.label,
        subfolders,
        files: fileCount,
      }),
    },
  }).onOk(async () => {
    try {
      await store.deleteFolder(node.id)
    } catch (e) {
      notifyErr(e, t('files.folderTree.deleteFolderFailed'))
    }
  })
}
</script>

<template>
  <q-tree
    :nodes="folderTree"
    node-key="id"
    label-key="label"
    v-model:selected="selected"
    default-expand-all
    no-selection-unset
    selected-color="primary"
  >
    <template #default-header="prop">
      <div class="row items-center no-wrap full-width folder-node">
        <q-icon :name="prop.node.icon" size="20px" class="q-mr-sm" color="amber-7" />
        <div class="ellipsis col">{{ prop.node.label }}</div>
        <q-badge
          v-if="countByFolder[prop.node.id]"
          color="grey-5"
          text-color="grey-9"
          :label="countByFolder[prop.node.id]"
          class="q-mr-xs"
        />
        <q-btn round flat dense size="sm" icon="more_vert" @click.stop>
          <q-menu auto-close>
            <q-list dense style="min-width: 140px">
              <q-item clickable @click="newFolder(prop.node)">
                <q-item-section avatar><q-icon name="create_new_folder" /></q-item-section>
                <q-item-section>{{ $t('files.folderTree.newSubfolder') }}</q-item-section>
              </q-item>
              <template v-if="prop.node.id !== 'root'">
                <q-item clickable @click="renameFolder(prop.node)">
                  <q-item-section avatar><q-icon name="edit" /></q-item-section>
                  <q-item-section>{{ $t('files.folderTree.rename') }}</q-item-section>
                </q-item>
                <q-item clickable @click="deleteFolder(prop.node)">
                  <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                  <q-item-section class="text-negative">{{ $t('common.delete') }}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </template>
  </q-tree>
</template>

<style scoped>
.folder-node {
  min-height: 32px;
}
</style>
