<script setup>
// 쇼 빌더 — 미러(단일 재생목록·완전 락스텝) / 분산(플레이어별 재생목록·시작 동기) 구성 + 저장/재생/정지.
// 각 온라인 플레이어의 재생목록은 fleet 프록시로 가져온다.
import { ref, computed, onMounted, watch } from 'vue'
import { useFleet } from 'src/composables/useFleet'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const { t } = useI18n()
const $q = useQuasar()
const fleet = useFleet()
const { onlinePlayers, show } = fleet

const mode = ref('mirror')
const domain = ref(0)
const leadMs = ref(1000)
const mirrorPlaylistId = ref(null)
const assignments = ref({}) // { [playerId]: playlistId }

const playlistsByPlayer = ref({}) // { [playerId]: [{playlistId,name,mode}] }
const loadPlaylists = async () => {
  const map = {}
  await Promise.all(
    onlinePlayers.value.map(async (p) => {
      map[p.id] = await fleet.fetchPlaylists(p.id)
    }),
  )
  playlistsByPlayer.value = map
}

watch(
  show,
  (s) => {
    mode.value = s.mode || 'mirror'
    domain.value = s.domain ?? 0
    leadMs.value = s.leadMs ?? 1000
    mirrorPlaylistId.value = s.mirrorPlaylistId ?? null
    const a = {}
    for (const [k, v] of Object.entries(s.assignments || {})) a[k] = v?.playlistId ?? null
    assignments.value = a
  },
  { immediate: true, deep: true },
)

onMounted(loadPlaylists)
watch(onlinePlayers, loadPlaylists, { deep: true })

const modeOptions = computed(() => [
  { label: t('fleet.modeMirror'), value: 'mirror' },
  { label: t('fleet.modeDistributed'), value: 'distributed' },
])
const plOptions = (id) =>
  (playlistsByPlayer.value[id] || []).map((pl) => ({ label: pl.name, value: pl.playlistId }))
// 미러 재생목록 옵션은 첫 온라인 플레이어 기준(전 대상이 동일 콘텐츠 보유 가정)
const mirrorOptions = computed(() => {
  const first = onlinePlayers.value[0]
  return first ? plOptions(first.id) : []
})

const saveShow = async () => {
  const asg = {}
  for (const [k, v] of Object.entries(assignments.value)) {
    if (v != null) asg[k] = { playlistId: v, trackIdx: 0 }
  }
  await fleet.saveShow({
    mode: mode.value,
    domain: Number(domain.value),
    leadMs: Number(leadMs.value),
    mirrorPlaylistId: mirrorPlaylistId.value,
    mirrorTrackIdx: 0,
    assignments: asg,
  })
}

const busy = ref(false)
const onSave = async () => {
  try {
    await saveShow()
    $q.notify({ type: 'positive', message: t('fleet.saveShow') })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.error || e.message })
  }
}
const onPlay = async () => {
  busy.value = true
  try {
    await saveShow()
    const r = await fleet.playShow()
    $q.notify({ type: 'positive', message: t('fleet.armed', { startAt: r.startAt }) })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.error || e.message })
  } finally {
    busy.value = false
  }
}
const onStop = async () => {
  try {
    await fleet.stopShow()
    $q.notify({ message: t('fleet.stopped') })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  }
}
</script>

<template>
  <q-card flat bordered class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-icon name="theaters" size="sm" class="q-mr-sm" />
      <span class="text-bold">{{ t('fleet.show') }}</span>
      <q-space />
      <q-btn round flat dense icon="save" class="q-mr-sm" @click="onSave">
        <q-tooltip>{{ t('fleet.saveShow') }}</q-tooltip>
      </q-btn>
      <q-btn round flat dense color="positive" icon="play_arrow" :loading="busy" @click="onPlay">
        <q-tooltip>{{ t('fleet.playShow') }}</q-tooltip>
      </q-btn>
      <q-btn round flat dense color="negative" icon="stop" class="q-ml-sm" @click="onStop">
        <q-tooltip>{{ t('fleet.stopShow') }}</q-tooltip>
      </q-btn>
    </div>

    <!-- 균일한 2열 그리드로 정렬 -->
    <div class="row q-col-gutter-md">
      <q-select
        class="col-12 col-sm-6"
        v-model="mode"
        :options="modeOptions"
        option-label="label"
        option-value="value"
        emit-value
        map-options
        dense
        outlined
        :label="t('fleet.showMode')"
      />
      <q-select
        v-if="mode === 'mirror'"
        class="col-12 col-sm-6"
        v-model="mirrorPlaylistId"
        :options="mirrorOptions"
        option-label="label"
        option-value="value"
        emit-value
        map-options
        dense
        outlined
        clearable
        :label="t('fleet.mirrorPlaylist')"
      />
      <q-input
        class="col-12 col-sm-6"
        v-model.number="domain"
        type="number"
        min="0"
        max="127"
        dense
        outlined
        :label="t('fleet.domain')"
      />
      <q-input
        class="col-12 col-sm-6"
        v-model.number="leadMs"
        type="number"
        min="0"
        dense
        outlined
        :label="t('fleet.leadTime')"
        suffix="ms"
      />
    </div>

    <div v-if="mode !== 'mirror'" class="q-mt-md">
      <div class="text-caption text-muted q-mb-xs">{{ t('fleet.assignments') }}</div>
      <div
        v-for="p in onlinePlayers"
        :key="p.id"
        class="row items-center q-col-gutter-sm q-mb-xs"
      >
        <div class="col-4 ellipsis">{{ p.name }}</div>
        <q-select
          class="col-8"
          v-model="assignments[p.id]"
          :options="plOptions(p.id)"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          dense
          outlined
          clearable
          :label="t('fleet.assignPlaylist')"
        />
      </div>
    </div>
  </q-card>
</template>
