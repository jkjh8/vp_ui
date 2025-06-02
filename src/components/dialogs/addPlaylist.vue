<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { storeToRefs } from 'pinia'
import DelayedTooltip from '../delayedTooltip.vue'
import { ruleExists } from 'src/composables/useRules'
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const playlistStore = usePlaylistStore()
const { playlists } = storeToRefs(playlistStore)

// 폼 데이터
const playlistId = ref(0)
const playlistName = ref('')
const playlistDescription = ref('')

// 고유한 playlistId 생성
const generatePlaylistId = () => {
  const arr = playlists?.value || []
  const existingIds = arr.map((p) => p.playlistId)
  let newId = 1
  while (existingIds.includes(newId)) {
    newId++
  }
  return Number(newId)
}

// 자동 플레이리스트 이름 생성
const generatePlaylistName = () => {
  const count = playlists?.value?.length || 0
  return `playlist ${count + 1}`
}

// 컴포넌트 마운트 시 기본 ID 및 이름 설정
onMounted(() => {
  playlistId.value = generatePlaylistId()
  playlistName.value = generatePlaylistName()
})

// 이름 유효성 검사
const isNameValid = computed(() => {
  return playlistName.value?.trim().length > 0
})

const existsPlaylistId = (id) => {
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
        <div class="text-h6 q-ml-md">새 플레이리스트 만들기</div>
      </q-card-section>
      <q-form
        @submit="
          onDialogOK({
            playlistId: playlistId,
            name: playlistName,
            description: playlistDescription,
          })
        "
      >
        <q-separator />
        <q-card-section class="q-pt-none">
          <q-input
            v-model="playlistName"
            label="플레이리스트 이름"
            filled
            dense
            autofocus
            :error="!isNameValid"
            :error-message="!isNameValid ? '플레이리스트 이름을 입력해주세요.' : ''"
            @keyup.enter="
              onDialogOK({ id: playlistId, name: playlistName, description: playlistDescription })
            "
          >
            <template v-slot:hint>
              <div class="text-caption text-grey-6">
                현재 {{ playlists?.length || 0 }}개의 플레이리스트가 있습니다
              </div>
            </template>
          </q-input>
          <q-input
            v-model="playlistId"
            label="플레이리스트 ID (자동 생성)"
            filled
            dense
            type="number"
            class="q-mt-md"
            :rules="[ruleExists, existsPlaylistId]"
            lazy-rules
          >
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
          <q-btn round flat icon="cancel" color="grey" @click="onDialogCancel">
            <DelayedTooltip msg="취소" />
          </q-btn>
          <q-btn round flat icon="check_circle" color="primary" type="submit">
            <DelayedTooltip msg="만들기" />
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
