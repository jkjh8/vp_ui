<script setup>
//pinia
import { useFilesStore } from 'src/stores/useFiles'

const { files } = useFilesStore()
</script>

<template>
  <q-table
    :rows="files"
    :columns="[
      { name: 'name', label: 'Name', field: 'name', align: 'center', sortable: true },
      { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
      { name: 'type', label: 'Type', field: 'type', align: 'center', sortable: true },
      { name: 'size', label: 'Size', field: 'size', align: 'center', sortable: true },
      { name: 'actions', label: 'Actions', align: 'center' },
    ]"
  >
  </q-table>
</template>

<style scoped></style>
