<script setup>
// 좌측 네비게이션 드로어 — 운영(홈·[마스터 콘솔]) / 콘텐츠 / 출력 / 시스템 그룹.
// 마스터 콘솔은 role=master 일 때만 노출. 오픈소스 고지는 설정 > 시스템 탭에 둔다.
// 활성 상태는 route.path 단일 소스. 미니 레일(gt-sm)에선 그룹 라벨 대신 구분선 + 항목 툴팁.
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useStatusStore } from 'src/stores/useStatus'

const $q = useQuasar()
const { pStatus } = storeToRefs(useStatusStore())
const isMaster = computed(() => pStatus.value.sync?.role === 'master')

const groups = computed(() => [
  {
    label: '', // 운영
    items: [
      { label: 'menu.home', icon: 'home', to: '/' },
      ...(isMaster.value ? [{ label: 'menu.fleet', icon: 'devices', to: '/fleet' }] : []),
    ],
  },
  {
    label: 'menu.groups.content',
    items: [
      { label: 'menu.playlist', icon: 'queue_music', to: '/playlist' },
      { label: 'menu.files', icon: 'folder', to: '/files' },
      { label: 'menu.sources', icon: 'sensors', to: '/sources' },
    ],
  },
  {
    label: 'menu.groups.output',
    items: [{ label: 'menu.layouts', icon: 'space_dashboard', to: '/layouts' }],
  },
  {
    label: 'menu.groups.system',
    items: [
      { label: 'menu.settings', icon: 'settings', to: '/settings' },
      { label: 'menu.help', icon: 'help', to: '/help' },
    ],
  },
])
</script>

<template>
  <div class="drawer-col column no-wrap full-height">
    <q-list padding class="col">
      <template v-for="(group, gi) in groups" :key="gi">
        <q-separator v-if="gi > 0" class="q-my-sm" />
        <div
          v-if="group.label && !$q.screen.gt.sm"
          class="drawer-group-label text-faint text-caption"
        >
          {{ $t(group.label) }}
        </div>
        <q-item
          v-for="item in group.items"
          :key="item.to"
          clickable
          :to="item.to"
          exact
          active-class="drawer-active"
          class="drawer-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ $t(item.label) }}</q-item-section>
          <q-tooltip v-if="$q.screen.gt.sm" anchor="center right" self="center left" :offset="[8, 0]">
            {{ $t(item.label) }}
          </q-tooltip>
        </q-item>
      </template>
    </q-list>
  </div>
</template>

<style scoped>
.drawer-group-label {
  padding: 4px 16px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.drawer-item {
  border-radius: var(--radius-md);
  margin: 2px 8px;
  color: var(--text-2);
}
.drawer-item:hover {
  background: var(--surface-2);
}
.drawer-active {
  background: var(--accent-weak);
  color: var(--accent);
  font-weight: 600;
}
.drawer-col {
  height: 100%;
}
</style>
