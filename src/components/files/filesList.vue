<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
//pinia

import { useFilesStore } from 'src/stores/useFiles'

const { getFileList } = useFilesStore()
const { files } = storeToRefs(useFilesStore())
onMounted(async () => {
  await getFileList()
})
</script>

<template>
  <q-table
    :rows="files"
    :columns="[
      { name: 'name', label: 'Name', field: 'originalname', align: 'center', sortable: true },
      { name: 'id', label: 'ID', field: 'number', align: 'center', sortable: true },
      { name: 'type', label: 'Type', field: 'mimetype', align: 'center', sortable: true },
      { name: 'size', label: 'Size', field: 'size', align: 'center', sortable: true },
      { name: 'actions', label: 'Actions', align: 'center' },
    ]"
  >
  </q-table>
  <div>
    {{ files }}
  </div>
</template>

<style scoped></style>
