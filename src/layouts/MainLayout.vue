<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppDrawer from 'components/menu/AppDrawer.vue'
import TransportBar from 'components/player/TransportBar.vue'
import MemoryBadge from 'components/setup/MemoryBadge.vue'
import DelayedTooltip from 'src/components/DelayedTooltip.vue'
import { useTheme } from 'src/composables/useTheme'
import { useLocale } from 'src/composables/useLocale'
import { usePlayback } from 'src/composables/usePlayback'

const { t } = useI18n()
const { locale, setLocale, options: localeOptions } = useLocale()
const localeShort = computed(
  () => localeOptions.find((o) => o.value === locale.value)?.short || 'EN',
)
const route = useRoute()
const router = useRouter()
const { isDark, toggle } = useTheme()

// 장면/윈도우 모드 토글 — usePlayback 파사드 경유. 컨텍스트 감응: 현재(편집/선택) 플레이리스트가 있으면
// 그 타입을 표시하고 클릭 시 그 플레이리스트를 즉시 전환(+전역 기본), 없으면 전역 기본만 설정.
const { playlists, currentPlaylist, globalMode, setGlobalMode } = usePlayback()
const currentPl = computed(() => playlists.value.find((p) => p._id === currentPlaylist.value))
const plMode = (p) => (p?.mode === 'window' ? 'window' : 'scene')
const playbackMode = computed({
  get: () => (currentPl.value ? plMode(currentPl.value) : globalMode.value),
  set: (v) => {
    if (currentPl.value && plMode(currentPl.value) === v) return
    setGlobalMode(v, currentPl.value?._id ?? null)
  },
})

// 트랜스포트 바: route.meta.transport === false 인 페이지(Home)에서만 숨김(홈은 자체 확장형 보유).
const showTransport = computed(() => route.meta.transport !== false)

// gt-md는 미니 레일 상주, 소형에서는 오버레이 + 햄버거
const drawerOpen = ref(true)
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="header row no-wrap items-center">
      <q-btn
        flat
        dense
        round
        icon="menu"
        class="lt-md"
        :aria-label="t('layout.menu')"
        @click="drawerOpen = !drawerOpen"
      />
      <div class="row items-center q-gutter-x-sm pointer" @click="router.push('/')">
        <q-icon name="svguse:icons.svg#logo" size="sm" />
        <div class="header-font">{{ t('layout.headerTitle') }}</div>
      </div>
      <q-space />
      <div class="row no-wrap items-center q-gutter-x-sm">
        <q-btn-toggle
          v-model="playbackMode"
          dense
          flat
          toggle-color="primary"
          color="grey-7"
          :options="[
            { value: 'scene', icon: 'view_carousel', slot: 'scene' },
            { value: 'window', icon: 'grid_view', slot: 'window' },
          ]"
        >
          <template #scene><DelayedTooltip :msg="t('layout.sceneMode')" /></template>
          <template #window><DelayedTooltip :msg="t('layout.windowMode')" /></template>
        </q-btn-toggle>
        <q-separator vertical inset class="q-mx-md" />
        <MemoryBadge class="q-mr-sm" />
        <q-btn-dropdown flat dense no-caps :label="localeShort" icon="translate" auto-close>
          <q-tooltip>{{ t('layout.language') }}</q-tooltip>
          <q-list dense>
            <q-item
              v-for="opt in localeOptions"
              :key="opt.value"
              clickable
              :active="locale === opt.value"
              @click="setLocale(opt.value)"
            >
              <q-item-section>{{ opt.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn
          flat
          dense
          round
          :icon="isDark ? 'light_mode' : 'dark_mode'"
          :aria-label="isDark ? t('layout.lightMode') : t('layout.darkMode')"
          @click="toggle"
        >
          <q-tooltip>{{ isDark ? t('layout.lightMode') : t('layout.darkMode') }}</q-tooltip>
        </q-btn>
      </div>
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      show-if-above
      :mini="$q.screen.gt.sm"
      :width="220"
      :mini-width="64"
      :breakpoint="1023"
      class="app-drawer"
    >
      <AppDrawer />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="showTransport" class="footer">
      <TransportBar variant="compact" />
    </q-footer>
  </q-layout>
</template>

<style scoped>
.app-drawer {
  background: var(--surface-1);
  border-right: 1px solid var(--border);
}
</style>
