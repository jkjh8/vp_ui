<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
//pinia
import { useFilesStore } from 'src/stores/useFiles'
import { addr } from 'src/boot/axios'
const { getFileList } = useFilesStore()
const { files } = storeToRefs(useFilesStore())
onMounted(async () => {
  await getFileList()
})

const humanReadableFileSize = (size) => {
  const i = Math.floor(Math.log(size) / Math.log(1024))
  return `${(size / Math.pow(1024, i)).toFixed(2)} ${['B', 'KB', 'MB', 'GB'][i]}`
}
const firstCharUpperCase = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<template>
  <q-table
    :rows="files"
    :columns="[
      { name: 'name', label: 'Name', field: 'originalname', align: 'left', sortable: true },
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
                width: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
              "
            >
              <q-img
                v-if="props.row.thumbnail"
                :src="`${addr}/api/files/thumbnail/${props.row.uuid}`"
                style="width: 50px; cursor: pointer"
                :alt="props.row.originalname"
                @mouseenter="props.row._showPreview = true"
                @mouseleave="props.row._showPreview = false"
              />
              <q-icon v-else name="play_arrow" size="sm" color="primary" />
              <q-img
                v-if="props.row.thumbnail && props.row._showPreview"
                :src="`${addr}/api/files/thumbnail/${props.row.uuid}`"
                style="
                  position: absolute;
                  top: 30;
                  left: 110%;
                  width: 200px;
                  z-index: 10;
                  border: 1px solid #ccc;
                  background: #fff;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                "
                :alt="props.row.originalname"
              />
            </div>
            <div>
              {{ props.row.originalname }}
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
            @click="$emit('view', props.row.id)"
          />
          <q-btn
            round
            flat
            dense
            icon="info"
            color="secondary"
            @click="$emit('edit', props.row.id)"
          />
          <q-btn
            round
            flat
            dense
            icon="download"
            color="primary"
            @click="$emit('download', props.row.id)"
          />
          <q-btn
            round
            flat
            dense
            icon="delete"
            color="negative"
            @click="$emit('delete', props.row.id)"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <div>
    {{ files }}
  </div>
</template>

<style scoped></style>
