<script setup>
import { useQuasar, useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../DelayedTooltip.vue'
import { useApiStore } from 'src/stores/useApi'
import { humanReadableFileSize } from 'src/composables/useUtils'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  folderId: { default: null },
})

const { t } = useI18n()
const $q = useQuasar()
const { dialogRef, onDialogOK } = useDialogPluginComponent()
const { getAddr } = useApiStore()

const getUrl = () => {
  return `${getAddr()}/api/files`
}

// 업로드 대상 폴더를 각 POST에 텍스트 필드로 실어보냄 (multer.any()가 req.body로 파싱)
const formFields = () => [{ name: 'folderId', value: props.folderId ?? '' }]

const onRejected = (rejectEntries) => {
  $q.notify({
    type: 'negative',
    message: t('dialogs.updateFiles.rejected', { count: rejectEntries.length }),
  })
}
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="rouneded">
      <q-card-section class="q-pa-none">
        <q-uploader
          flat
          class="uploader"
          style="background-color: transparent; width: 100%"
          text-color="grey-10"
          color="grey-2"
          multiple
          :url="getUrl"
          :field-name="(file) => encodeURIComponent(file.name)"
          :form-fields="formFields"
          accept="image/*,video/*,audio/*"
          @rejected="onRejected"
        >
          <template #header="scope">
            <div class="row no-wrap items-center q-pa-md q-gutter-x-sm">
              <!-- clear all btn -->
              <q-btn
                v-if="scope.queuedFiles.length > 0"
                round
                flat
                color="primary"
                icon="clear_all"
                @click="scope.removeQueuedFiles"
              >
                <DelayedTooltip :msg="$t('dialogs.updateFiles.clearAll')" />
              </q-btn>
              <!-- remove uploaded files -->
              <q-btn
                v-if="scope.uploadedFiles.length > 0"
                round
                flat
                icon="done_all"
                @click="scope.removeUploadedFiles"
              >
                <DelayedTooltip :msg="$t('dialogs.updateFiles.removeUploaded')" />
              </q-btn>
              <q-icon
                v-if="scope.queuedFiles.length === 0 && scope.uploadedFiles.length === 0"
                name="upload"
                size="sm"
              ></q-icon>
              <!-- is uploading -->
              <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
              <!-- Name Tag -->
              <div class="col q-px-sm">
                <div class="q-uploader__title">{{ $t('dialogs.updateFiles.uploadFilesTitle') }}</div>
                <div class="q-uploader__subtitle">
                  {{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}
                </div>
              </div>
              <!-- add files -->
              <q-btn
                v-if="scope.canAddFiles"
                round
                flat
                type="a"
                color="grey"
                icon="add_box"
                @click="scope.pickFiles"
              >
                <q-uploader-add-trigger />
                <DelayedTooltip :msg="$t('dialogs.updateFiles.pickFiles')" />
              </q-btn>
              <!-- upload files -->
              <q-btn
                v-if="scope.canUpload"
                round
                flat
                color="primary"
                icon="cloud_upload"
                @click="scope.upload"
              >
                <DelayedTooltip :msg="$t('dialogs.updateFiles.uploadFiles')" />
              </q-btn>
              <!-- abort upload -->
              <q-btn v-if="scope.isUploading" round flat icon="clear" @click="scope.abort">
                <DelayedTooltip :msg="$t('dialogs.updateFiles.abortUpload')" />
              </q-btn>
            </div>
          </template>

          <!-- 파일 리스트 커스텀 슬롯 -->
          <template #list="scope">
            <div
              v-if="scope.files.length === 0"
              class="empty-list-message q-pa-lg flex flex-center column items-center"
              @click="scope.pickFiles"
              style="cursor: pointer"
            >
              <q-icon name="add_circle" size="3rem" color="grey-5" />
              <div class="text-h6 text-grey-7 q-mt-sm">{{ $t('dialogs.updateFiles.addFiles') }}</div>
            </div>
            <q-list v-else class="fit">
              <q-item v-for="file in scope.files" :key="file.name" class="q-py-md">
                <q-item-section>
                  <q-item-label>{{ file.name }}</q-item-label>
                  <q-item-label caption>
                    {{ humanReadableFileSize(file.size) }} / {{ file.__status }}
                  </q-item-label>
                </q-item-section>
                <q-item-section v-if="file.__status === 'uploaded'" side>
                  <q-icon name="done" color="positive" />
                </q-item-section>
                <q-item-section v-if="file.__status === 'failed'" side>
                  <q-icon name="error" color="negative" />
                </q-item-section>
                <q-item-section
                  v-if="file.__status === 'uploading'"
                  side
                  class="q-pa-none flex flex-center"
                >
                  <q-circular-progress
                    show-value
                    color="primary"
                    :value="Math.round(file.__progress * 100)"
                    size="2rem"
                    :thickness="0.4"
                  >
                  </q-circular-progress>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </q-uploader>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn round flat icon="cancel" color="grey" @click="onDialogOK">
          <DelayedTooltip :msg="$t('common.close')" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  width: 50%;
  max-width: 800px;
  min-width: 350px;
  border-radius: var(--radius-lg);
  background-color: var(--surface-1);
  overflow: hidden;
}

.empty-list-message {
  height: 150px;
  width: 100%;
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-md);
  margin: 16px;
  max-width: calc(100% - 32px);
  transition: border-color 0.2s;
}
.empty-list-message:hover {
  border-color: var(--accent);
  background: var(--accent-weak);
}
</style>
