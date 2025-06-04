<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { storeToRefs } from 'pinia'
import DelayedTooltip from '../delayedTooltip.vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const playlistStore = usePlaylistStore()
const { playlists } = storeToRefs(playlistStore)

// props로 기존 데이터를 받음
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
})

// 폼 데이터
const playlist = ref({
  playlistId: 0,
  name: '',
  description: '',
})

// 고유한 playlistId 생성
const generatePlaylistId = () => {
  const existingIds = playlists.value.map((p) => p.playlistId)
  let newId = 1
  while (existingIds.includes(newId)) {
    newId++
  }
  return newId
}

// 컴포넌트 마운트 시 초기값 설정
onMounted(() => {
  if (props.initialData?.playlistId) {
    // 수정 모드
    playlist.value = { ...props.initialData }
  } else {
    // 추가 모드
    playlist.value.playlistId = generatePlaylistId()
    playlist.value.name = `playlist ${playlists.value.length + 1}`
  }
  console.log('초기화된 playlist:', playlist.value, '기존 데이터:', props.initialData)
})

// 이름 유효성 검사
const isNameValid = computed(() => playlist.value.name.trim().length > 0)

// ID 중복 검사
const existsPlaylistId = (id) => {
  // 수정 모드일 때는 자신의 playlistId와 중복이어도 허용
  if (props.initialData?.playlistId && Number(id) === Number(props.initialData.playlistId)) {
    return true
  }
  return (
    !playlists.value.some((p) => p.playlistId === Number(id)) ||
    '이미 존재하는 플레이리스트 ID입니다.'
  )
}
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <q-icon name="playlist_add" size="2em" color="primary" />
        <div class="text-h6 q-ml-md">
          {{ props.initialData?.playlistId ? '플레이리스트 수정' : '새 플레이리스트 만들기' }}
        </div>
      </q-card-section>
      <q-form @submit.prevent="onDialogOK(playlist)">
        <q-separator />
        <q-card-section class="q-pt-none">
          <q-input
            v-model="playlist.name"
            label="플레이리스트 이름"
            filled
            dense
            autofocus
            :error="!isNameValid"
            :error-message="!isNameValid ? '플레이리스트 이름을 입력해주세요.' : ''"
          >
            <template v-slot:hint>
              <div class="text-caption text-grey-6">
                현재 {{ playlists.length }}개의 플레이리스트가 있습니다
              </div>
            </template>
          </q-input>
          <q-input
            v-model="playlist.playlistId"
            label="플레이리스트 ID (자동 생성)"
            filled
            dense
            type="number"
            class="q-mt-md"
            :rules="[existsPlaylistId]"
            lazy-rules
          />
          <q-input
            v-model="playlist.description"
            label="설명 (선택사항)"
            outlined
            dense
            type="textarea"
            rows="2"
            class="q-mt-md"
            placeholder="플레이리스트에 대한 설명을 입력하세요..."
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn round flat icon="cancel" color="grey" @click="onDialogCancel">
            <DelayedTooltip msg="취소" />
          </q-btn>
          <q-btn round flat icon="check_circle" color="primary" type="submit">
            <DelayedTooltip msg="{{ props.initialData?.playlistId ? '수정하기' : '만들기' }}" />
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
