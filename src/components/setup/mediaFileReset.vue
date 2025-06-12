<script setup>
import { useQuasar } from 'quasar'
import { useApiStore } from 'src/stores/useApi'
import confirmDialog from '../dialogs/confirmDialog.vue'
import DelayedTooltip from '../delayedTooltip.vue'

const $q = useQuasar()
const { apiCallWithLoading } = useApiStore()

const onMediaReset = () => {
  $q.dialog({
    component: confirmDialog,
    componentProps: {
      title: '미디어 리셋',
      message: '정말로 미디어 파일을 초기화하시겠습니까?',
    },
  }).onOk(async () => {
    try {
      await apiCallWithLoading('/files/reset_all', 'GET', {}, '미디어 파일을 초기화 중...')
      $q.notify({
        type: 'positive',
        message: '미디어 파일이 초기화되었습니다.',
      })
    } catch (error) {
      console.error('Media reset error:', error)
      $q.notify({
        type: 'negative',
        message: '초기화 중 오류가 발생했습니다.',
      })
    }
  })
}
</script>

<template>
  <div class="row justify-between items-center">
    <div>
      <q-icon name="visibility" size="sm" color="primary"></q-icon>
      <span class="q-ml-sm text-bold">Media File All Clear</span>
    </div>
    <q-btn round flat color="negative" icon="delete" @click="onMediaReset">
      <DelayedTooltip msg="미디어 파일 초기화" />
    </q-btn>
  </div>
</template>

<style scoped></style>
