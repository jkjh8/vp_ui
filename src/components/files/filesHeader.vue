<script setup>
import { useQuasar } from 'quasar'
import UploadFiles from '../dialogs/updateFiles.vue'
const $q = useQuasar()

const fnUploadFiles = () => {
  $q.dialog({
    component: UploadFiles,
  }).onOk(() => {
    //
  })
}
</script>

<template>
  <div class="row no-wrap justify-between items-center">
    <div class="row no-wrap items-center q-gutter-x-sm">
      <q-icon name="folder" size="md" color="yellow" />
      <div class="text-title">Files</div>
    </div>
    <div>
      <q-btn round flat color="primary" icon="add_circle" @click="fnUploadFiles" />
    </div>
  </div>
</template>

<style scoped></style>
