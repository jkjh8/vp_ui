<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { storeToRefs } from 'pinia'
import DelayedTooltip from '../delayedTooltip.vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const playlistStore = usePlaylistStore()
const { playlist } = storeToRefs(playlistStore)

// 폼 데이터
const playlistName = ref('')
const playlistDescription = ref('')
const isLoading = ref(false)

// 자동 플레이리스트 이름 생성
const generatePlaylistName = () => {
  const playlistCount = playlist.value?.length || 0
  return `playlist ${playlistCount + 1}`
}

// 컴포넌트 마운트 시 기본 이름 설정
onMounted(() => {
  playlistName.value = generatePlaylistName()
})

// 플레이리스트 추가
const handleAddPlaylist = async () => {
  if (!isNameValid.value || isDuplicateName.value) {
    return
  }

  try {
    isLoading.value = true

    const playlistData = {
      name: playlistName.value.trim(),
      description: playlistDescription.value.trim(),
      items: [],
    }

    await playlistStore.addPlaylist(playlistData)

    // 성공 시 데이터와 함께 다이얼로그 완료
    onDialogOK(playlistData)
  } catch (error) {
    console.error('플레이리스트 추가 실패:', error)
  } finally {
    isLoading.value = false
  }
}

// 취소
const handleCancel = () => {
  onDialogCancel()
}

// 이름 유효성 검사
const isNameValid = computed(() => {
  return playlistName.value.trim().length > 0
})

// 중복 이름 검사
const isDuplicateName = computed(() => {
  if (!playlist.value) return false
  return playlist.value.some(
    (p) => p.name.toLowerCase() === playlistName.value.trim().toLowerCase(),
  )
})
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <q-icon name="playlist_add" size="2em" color="primary" />
        <div class="text-h6 q-ml-md">새 플레이리스트 만들기</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="playlistName"
          label="플레이리스트 이름"
          filled
          dense
          autofocus
          :error="!isNameValid || isDuplicateName"
          :error-message="
            !isNameValid
              ? '플레이리스트 이름을 입력해주세요.'
              : isDuplicateName
                ? '이미 존재하는 이름입니다.'
                : ''
          "
          @keyup.enter="handleAddPlaylist"
        >
          <template v-slot:hint>
            <div class="text-caption text-grey-6">
              현재 {{ playlist?.length || 0 }}개의 플레이리스트가 있습니다
            </div>
          </template>
        </q-input>

        <q-input
          v-model="playlistDescription"
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
        <q-btn round flat icon="cancel" color="grey" @click="handleCancel" :disable="isLoading">
          <DelayedTooltip msg="취소" />
        </q-btn>
        <q-btn
          round
          flat
          icon="check_circle"
          color="primary"
          @click="handleAddPlaylist"
          :disable="!isNameValid || isDuplicateName || isLoading"
          :loading="isLoading"
        >
          <DelayedTooltip msg="만들기" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-card {
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
