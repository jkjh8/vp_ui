<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { usePlaylistStore } from 'src/stores/usePlaylist'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import DelayedTooltip from '../DelayedTooltip.vue'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const { t } = useI18n()

const playlistStore = usePlaylistStore()
const { playlists } = storeToRefs(playlistStore)
const { pStatus } = storeToRefs(useStatusStore())

const modeOptions = computed(() => [
  { label: t('dialogs.addPlaylist.modeSceneLabel'), value: 'scene' },
  { label: t('dialogs.addPlaylist.modeWindowLabel'), value: 'window' },
])

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
  mode: 'scene', // 'scene' | 'window'
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
    playlist.value = { mode: 'scene', ...props.initialData }
  } else {
    // 추가 모드 — 기본 타입 = 현재 전역 작업 모드
    playlist.value.playlistId = generatePlaylistId()
    playlist.value.name = `playlist ${playlists.value.length + 1}`
    playlist.value.mode = pStatus.value.playbackMode === 'window' ? 'window' : 'scene'
  }
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
    t('dialogs.addPlaylist.duplicateIdError')
  )
}
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <q-icon name="playlist_add" size="2em" color="primary" />
        <div class="text-h6 q-ml-md">
          {{
            props.initialData?.playlistId
              ? $t('dialogs.addPlaylist.editTitle')
              : $t('dialogs.addPlaylist.createTitle')
          }}
        </div>
      </q-card-section>
      <q-form @submit.prevent="onDialogOK(playlist)">
        <q-separator />
        <q-card-section class="q-pt-none">
          <q-input
            v-model="playlist.name"
            :label="$t('dialogs.addPlaylist.nameLabel')"
            filled
            dense
            autofocus
            :error="!isNameValid"
            :error-message="!isNameValid ? $t('dialogs.addPlaylist.nameRequired') : ''"
          >
            <template v-slot:hint>
              <div class="text-caption text-grey-6">
                {{ $t('dialogs.addPlaylist.currentCount', { count: playlists.length }) }}
              </div>
            </template>
          </q-input>
          <q-input
            v-model="playlist.playlistId"
            :label="$t('dialogs.addPlaylist.idLabel')"
            filled
            dense
            type="number"
            class="q-mt-md"
            :rules="[existsPlaylistId]"
            lazy-rules
          />
          <q-select
            v-model="playlist.mode"
            :options="modeOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            filled
            dense
            class="q-mt-md"
            :label="$t('dialogs.addPlaylist.typeLabel')"
          >
            <template v-slot:hint>
              <div class="text-caption text-grey-6">
                {{ $t('dialogs.addPlaylist.typeHint') }}
              </div>
            </template>
          </q-select>
          <q-input
            v-model="playlist.description"
            :label="$t('dialogs.addPlaylist.descriptionLabel')"
            outlined
            dense
            type="textarea"
            rows="2"
            class="q-mt-md"
            :placeholder="$t('dialogs.addPlaylist.descriptionPlaceholder')"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn round flat icon="cancel" color="grey" @click="onDialogCancel">
            <DelayedTooltip :msg="$t('common.cancel')" />
          </q-btn>
          <q-btn round flat icon="check_circle" color="primary" type="submit">
            <DelayedTooltip
              :msg="
                props.initialData?.playlistId
                  ? $t('dialogs.addPlaylist.editAction')
                  : $t('dialogs.addPlaylist.createAction')
              "
            />
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
