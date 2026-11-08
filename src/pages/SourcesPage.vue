<script setup>
// 라이브 입력 소스(RTP/RTSP/SRT/NDI) 관리 페이지 — 파일과 별개 축. 정의 CRUD + 귀속/상태.
// 창 귀속(sourceId)은 화면 구성(Layouts)에서 설정하고, 여기서는 소스 정의와 현재 상태를 본다.
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useSourcesStore } from 'src/stores/useSources'
import { useStatusStore } from 'src/stores/useStatus'
import PageHeader from 'src/components/ui/PageHeader.vue'
import DelayedTooltip from 'src/components/DelayedTooltip.vue'
import addSource from 'src/components/dialogs/addSource.vue'

const $q = useQuasar()
const { t } = useI18n()
const sourcesStore = useSourcesStore()
const { sources } = storeToRefs(sourcesStore)
const { pStatus } = storeToRefs(useStatusStore())

onMounted(() => sourcesStore.getSources())

const summary = (s) => {
  if (s.kind === 'rtp' || s.kind === 'udp') {
    const r = s.rtp || {}
    const codec = s.kind === 'rtp' ? ` · ${r.encoding_name || 'AUTO'}` : ''
    return `${s.kind.toUpperCase()} · ${r.address || '0.0.0.0'}:${r.port}${codec}`
  }
  if (s.kind === 'ndi') return `NDI · ${s.ndi_name || s.url_address || '—'}`
  return `${s.kind.toUpperCase()} · ${s.uri || '—'}`
}

// 이 소스를 귀속한 창들 + 각 창의 라이브 상태(sourceStates).
const bindingsFor = (id) =>
  (pStatus.value.windows || [])
    .filter((w) => w.sourceId === id)
    .map((w) => ({
      name: w.name || `Window ${w.id}`,
      state: pStatus.value.sourceStates?.[w.id]?.state || null,
    }))

// 상태 점 색 — 의미 있는 상태에만 색, 나머지는 중립.
const dotColor = (state) =>
  ({ playing: 'positive', error: 'negative', connecting: 'warning', reconnecting: 'warning' })[state] ||
  'grey-5'

const openAdd = () => $q.dialog({ component: addSource }).onOk((d) => sourcesStore.createSource(d))
const openEdit = (s) =>
  $q
    .dialog({ component: addSource, componentProps: { initialData: s } })
    .onOk((d) => sourcesStore.updateSource(s.id, d))
const confirmDelete = (s) =>
  $q
    .dialog({
      title: t('sources.deleteTitle'),
      message: t('sources.deleteConfirm', { name: s.name }),
      cancel: true,
      persistent: true,
    })
    .onOk(() => sourcesStore.deleteSource(s.id))
</script>

<template>
  <q-page padding>
    <PageHeader icon="sensors" :title="$t('sources.title')">
      <template #actions>
        <q-btn color="primary" icon="add" round flat dense @click="openAdd">
          <DelayedTooltip :msg="$t('sources.add')" />
        </q-btn>
      </template>
    </PageHeader>

    <q-card v-if="sources.length" flat bordered>
      <q-list separator>
        <q-item v-for="s in sources" :key="s.id">
          <q-item-section avatar>
            <q-icon :name="s.kind === 'ndi' ? 'cast' : s.kind === 'rtsp' ? 'videocam' : 'lan'" class="text-muted" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ s.name }}</q-item-label>
            <q-item-label caption>{{ summary(s) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center no-wrap q-gutter-x-sm">
              <template v-if="bindingsFor(s.id).length">
                <span
                  v-for="(b, i) in bindingsFor(s.id)"
                  :key="i"
                  class="row items-center no-wrap text-caption text-muted"
                >
                  <q-icon name="circle" size="8px" :color="dotColor(b.state)" class="q-mr-xs" />
                  {{ b.name }}
                </span>
              </template>
              <span v-else class="text-caption text-faint">{{ $t('sources.notBound') }}</span>
              <q-btn flat round dense icon="edit" color="grey-7" @click="openEdit(s)" />
              <q-btn flat round dense icon="delete" color="grey-7" @click="confirmDelete(s)" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <div v-else class="text-caption text-muted q-pa-md">{{ $t('sources.empty') }}</div>
  </q-page>
</template>

<style scoped></style>
