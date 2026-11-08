<script setup>
// 파일 이동 대상 폴더 선택 — onDialogOK(folderId | null)로 반환('root'→null).
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { storeToRefs } from 'pinia'
import { useFilesStore } from 'src/stores/useFiles'
import DelayedTooltip from '../DelayedTooltip.vue'

const props = defineProps({
  currentFolderId: { default: null },
  count: { type: Number, default: 1 },
})

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const { folderTree } = storeToRefs(useFilesStore())

const selected = ref(props.currentFolderId ?? 'root')

const submit = () => onDialogOK(selected.value === 'root' ? null : selected.value)
</script>

<template>
  <q-dialog ref="dialogRef">
    <q-card style="min-width: 360px">
      <q-card-section class="row items-center">
        <q-icon name="drive_file_move" size="2em" color="primary" />
        <div class="text-h6 q-ml-md">{{ $t('dialogs.moveToFolder.title', { count: props.count }) }}</div>
      </q-card-section>
      <q-separator />
      <q-card-section style="max-height: 50vh; overflow: auto">
        <q-tree
          :nodes="folderTree"
          node-key="id"
          label-key="label"
          v-model:selected="selected"
          default-expand-all
          no-selection-unset
          selected-color="primary"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn round flat icon="cancel" color="grey" @click="onDialogCancel">
          <DelayedTooltip :msg="$t('common.cancel')" />
        </q-btn>
        <q-btn round flat icon="check_circle" color="primary" @click="submit">
          <DelayedTooltip :msg="$t('dialogs.moveToFolder.move')" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: var(--radius-lg);
  background-color: var(--surface-1);
}
</style>
