<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
// dialog
import MetaData from '../dialogs/metaData.vue'
import DeleteFile from '../dialogs/deleteFile.vue'
//pinia
import { useApiStore } from 'src/stores/useApi'
import { useStatusStore } from 'src/stores/useStatus'
import { useFilesStore } from 'src/stores/useFiles'
import { usePlayerStore } from '/src/stores/usePlayer.js'
// composables
import { firstCharUpperCase, humanReadableFileSize } from 'src/composables/useUtils.js'

const $q = useQuasar()
const { getFileList } = useFilesStore()
const { files } = storeToRefs(useFilesStore())
const { pStatus } = storeToRefs(useStatusStore())
const { getAddr } = useApiStore()
const { fnPlayById } = usePlayerStore()
// Fetch the file list when the component is mounted
onMounted(async () => {
  await getFileList()
})

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
          message: `Deleting file with ID ${file.fieldname}...`,
        })
        $q.notify({
          type: 'positive',
          message: `File with ID ${file.fieldname} deleted successfully.`,
        })
        // Call the delete function from the store
        useFilesStore().deleteFile(file)
        useFilesStore().getFileList()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: `Error deleting file with ID ${file.fieldname}: ${error.message}`,
        })
      } finally {
        $q.loading.hide()
      }
    })
    .onCancel(() => {
      $q.notify({
        type: 'negative',
        message: 'File deletion cancelled.',
      })
    })
}
</script>

<template>
  <q-table
    :rows="files"
    :columns="[
      { name: 'name', label: 'Name', field: 'filename', align: 'left', sortable: true },
      { name: 'id', label: 'ID', field: 'number', align: 'center', sortable: true },
      { name: 'type', label: 'Type', field: 'mimetype', align: 'center', sortable: true },
      { name: 'size', label: 'Size', field: 'size', align: 'center', sortable: true },
      { name: 'actions', label: 'Actions', align: 'center' },
    ]"
    :pagination="{
      rowsPerPage: 10,
      page: 1,
      sortBy: 'id',
      descending: false,
    }"
  >
    <!-- 이름 앞에 썸네일 표시: uuid로 요청하고 썸네일 파일을 서버에서 받아와서 표시 -->
    <template v-slot:body="props">
      <q-tr :props="props">
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
                    style="
                      width: 200px;
                      max-width: 300px;
                      border: 1px solid #ccc;
                      background: #fff;
                      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                    "
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
          <q-btn
            round
            flat
            dense
            icon="play_arrow"
            color="primary"
            @click="
              () => {
                pStatus.playlistMode = false
                fnPlayById(props.row.number)
              }
            "
          />
          <q-btn
            round
            flat
            dense
            icon="info"
            color="secondary"
            @click="fnShowMetaData(props.row)"
          />
          <q-btn
            round
            flat
            dense
            icon="download"
            color="primary"
            @click="useFilesStore().downloadFile(props.row)"
          />
          <q-btn round flat dense icon="delete" color="negative" @click="fnDeleteFile(props.row)" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<style scoped></style>
