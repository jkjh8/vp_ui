<script setup>
import { useDialogPluginComponent } from 'quasar'
import { ref, onMounted } from 'vue'
import { useFilesStore } from 'src/stores/useFiles'
import { useApiStore } from 'src/stores/useApi'
import { storeToRefs } from 'pinia'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  playlist: {
    type: Object,
    required: true,
  },
})

const tracks = ref([])
const { getAddr } = useApiStore()
const { files } = storeToRefs(useFilesStore())

onMounted(async () => {
  await useFilesStore().getFileList()
})
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="dialog-card">
      <q-card-section class="row justify-between items-center q-pb-sm">
        <div class="row items-center">
          <q-icon name="playlist_add" size="sm" color="primary"></q-icon>
          <div class="text-h6 q-ml-sm">Add Tracks</div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row items-center q-gutter-x-sm">
          <span class="text-caption"> Current Playlist: </span>
          <span class="text-bold">
            {{ props.playlist?.name || 'Unknown Playlist' }}
          </span>
        </div>
        <q-list bordered separator class="q-pa-none">
          <q-item
            v-for="(file, index) in files || []"
            :key="index"
            class="q-pa-sm"
            clickable
            :active="tracks.includes(file)"
            @click="
              () => {
                const i = tracks.indexOf(file)
                if (i === -1) tracks.push(file)
                else tracks.splice(i, 1)
              }
            "
          >
            <q-item-section avatar>
              <q-img
                :src="`${getAddr()}/api/files/thumbnail/${file.uuid}`"
                style="max-width: 50px; max-height: 30px"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ file.filename }}</q-item-label>
              <q-item-label caption>{{ file.mime }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-checkbox
                :model-value="tracks.includes(file)"
                @update:model-value="
                  (checked) => {
                    if (checked) tracks.push(file)
                    else tracks = tracks.filter((f) => f !== file)
                  }
                "
                @click.stop
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat round color="negative" icon="cancel" @click="onDialogCancel" />
        <q-btn flat round color="primary" icon="check_circle" @click="onDialogOK(tracks)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.8); /* 배경색에 투명도 추가 (0.9 = 90% 불투명) */
  min-width: 350px;
  max-width: 600px; /* 리스트의 최대 너비 설정 */
  width: 50%;
}
.q-list {
  max-height: 400px; /* 리스트의 최대 높이 설정 */
  overflow-y: auto; /* 스크롤 가능하도록 설정 */
}
</style>
