<script setup>
import { onMounted, ref, watch } from 'vue'
import FilesHeader from 'src/components/files/filesHeader.vue'
import FilesList from 'src/components/files/filesList.vue'
import FolderTree from 'src/components/files/folderTree.vue'
import { useFilesStore } from 'src/stores/useFiles'

const store = useFilesStore()
const splitter = ref(24)

// 폴더 패널 접기 — 선택 상태를 로컬에 유지(재방문 시 복원)
const foldersCollapsed = ref(localStorage.getItem('files.foldersCollapsed') === '1')
watch(foldersCollapsed, (v) => localStorage.setItem('files.foldersCollapsed', v ? '1' : '0'))

onMounted(async () => {
  await Promise.all([store.getFileList(), store.getFolders()])
})
</script>

<template>
  <q-page padding>
    <FilesHeader />
    <q-card flat bordered>
      <q-card-section class="q-py-xs">
        <!-- 펼침: 좌측 폴더 트리 + 우측 파일 목록 -->
        <q-splitter
          v-if="!foldersCollapsed"
          v-model="splitter"
          :limits="[15, 45]"
          style="min-height: 60vh"
        >
          <template #before>
            <div class="q-pr-sm q-pt-sm">
              <div class="row items-center no-wrap q-mb-xs">
                <div class="text-caption text-weight-medium text-grey-7 col ellipsis">
                  {{ $t('files.folderTree.title') }}
                </div>
                <q-btn round flat dense size="sm" icon="chevron_left" @click="foldersCollapsed = true">
                  <q-tooltip>{{ $t('files.folderTree.collapse') }}</q-tooltip>
                </q-btn>
              </div>
              <FolderTree />
            </div>
          </template>
          <template #after>
            <FilesList class="q-pl-sm" />
          </template>
        </q-splitter>

        <!-- 접힘: 폴더 트리 숨김, 파일 목록 전폭 + 펼치기 버튼 -->
        <div v-else class="row no-wrap items-start" style="min-height: 60vh">
          <q-btn
            round
            flat
            dense
            size="sm"
            icon="chevron_right"
            class="q-mt-sm"
            @click="foldersCollapsed = false"
          >
            <q-tooltip>{{ $t('files.folderTree.expand') }}</q-tooltip>
          </q-btn>
          <FilesList class="q-pl-sm col" />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped></style>
