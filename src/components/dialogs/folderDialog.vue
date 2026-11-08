<script setup>
// 폴더 생성/이름변경 다이얼로그 — onDialogOK(name)로 이름 문자열 반환.
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../DelayedTooltip.vue'

const props = defineProps({
  title: { type: String, default: '새 폴더' },
  initialName: { type: String, default: '' },
})

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const name = ref(props.initialName)

const submit = () => {
  const v = name.value.trim()
  if (!v) return
  onDialogOK(v)
}
</script>

<template>
  <q-dialog ref="dialogRef">
    <q-card style="min-width: 340px">
      <q-card-section class="row items-center">
        <q-icon name="create_new_folder" size="2em" color="primary" />
        <div class="text-h6 q-ml-md">{{ props.title || $t('dialogs.folderDialog.titleDefault') }}</div>
      </q-card-section>
      <q-form @submit.prevent="submit">
        <q-separator />
        <q-card-section class="q-pt-md">
          <q-input
            v-model="name"
            :label="$t('dialogs.folderDialog.nameLabel')"
            filled
            dense
            autofocus
            :rules="[(v) => (v && v.trim().length > 0) || $t('dialogs.folderDialog.nameRequired')]"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn round flat icon="cancel" color="grey" @click="onDialogCancel">
            <DelayedTooltip :msg="$t('common.cancel')" />
          </q-btn>
          <q-btn round flat icon="check_circle" color="primary" type="submit">
            <DelayedTooltip :msg="$t('common.confirm')" />
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: var(--radius-lg);
  background-color: var(--surface-1);
}
</style>
