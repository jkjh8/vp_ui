<script setup>
import { useQuasar, useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../delayedTooltip.vue'
import { addr } from 'src/boot/axios.js'

const $q = useQuasar()
const { dialogRef, onDialogOK } = useDialogPluginComponent()

const getUrl = () => {
  return `${addr}/api/files/upload`
}

const onRejected = (rejectEntries) => {
  $q.notify({
    type: 'negative',
    message: `${rejectEntries.length} file(s) did not pass validation constraints`,
  })
}
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-uploader
      class="uploader"
      style="width: 100%; max-width: 800px; min-width: 300px"
      multiple
      :url="getUrl"
      :field-name="(file) => encodeURIComponent(file.name)"
      color="primary"
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
            icon="clear_all"
            @click="scope.removeQueuedFiles"
          >
            <DelayedTooltip msg="Clear All" />
          </q-btn>
          <!-- remove uploaded files -->
          <q-btn
            v-if="scope.uploadedFiles.length > 0"
            round
            flat
            icon="done_all"
            @click="scope.removeUploadedFiles"
          >
            <DelayedTooltip msg="Remove Uploaded Files" />
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
            <div class="q-uploader__title">Upload Files</div>
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
            icon="add_box"
            @click="scope.pickFiles"
          >
            <q-uploader-add-trigger />
            <DelayedTooltip msg="Pick Files" />
          </q-btn>
          <!-- upload files -->
          <q-btn v-if="scope.canUpload" round flat icon="cloud_upload" @click="scope.upload">
            <DelayedTooltip msg="Upload Files" />
          </q-btn>
          <!-- abort upload -->
          <q-btn v-if="scope.isUploading" round flat icon="clear" @click="scope.abort">
            <DelayedTooltip msg="Abrot Upload" />
          </q-btn>
          <!-- close dialog -->
          <q-btn round flat icon="cancel" @click="onDialogOK">
            <DelayedTooltip msg="Close" />
          </q-btn>
        </div>
      </template>
    </q-uploader>
  </q-dialog>
</template>

<style scoped></style>
