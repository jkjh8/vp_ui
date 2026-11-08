<script setup>
// 설정 — 카테고리 탭(일반/재생/오디오/동기화/시스템)으로 나눠 한 번에 한 묶음만 보여준다.
// 선택 탭은 ?tab= 쿼리로 유지(새로고침·링크 공유 시 복원).
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import PageHeader from 'src/components/ui/PageHeader.vue'
import SettingsSection from 'src/components/setup/SettingsSection.vue'
import serverPort from 'src/components/setup/ServerPort.vue'
import imageTime from 'src/components/setup/imageTime.vue'
import BackgroundColor from 'src/components/setup/backgroundColor.vue'
import audioDevice from 'src/components/setup/audioDevice.vue'
import mediaFileReset from 'src/components/setup/mediaFileReset.vue'
import startOnPlay from 'src/components/setup/startOnPlay.vue'
import autoStart from 'src/components/setup/autoStart.vue'
import hardwareAccel from 'src/components/setup/hardwareAccel.vue'
import MemoryIndicator from 'src/components/setup/MemoryIndicator.vue'
import PrerollSettings from 'src/components/setup/PrerollSettings.vue'
import SyncManager from 'src/components/setup/SyncManager.vue'
import softwareUpdate from 'src/components/setup/softwareUpdate.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'general', icon: 'tune' },
  { name: 'playback', icon: 'play_circle' },
  { name: 'audio', icon: 'volume_up' },
  { name: 'sync', icon: 'sync' },
  { name: 'system', icon: 'computer' },
]
const tab = computed({
  get: () => (tabs.some((x) => x.name === route.query.tab) ? route.query.tab : 'general'),
  set: (v) => router.replace({ query: { ...route.query, tab: v } }),
})
const vertical = computed(() => $q.screen.gt.sm)
</script>

<template>
  <q-page padding>
    <div class="settings-wrap">
      <PageHeader icon="settings" :title="$t('setup.settings.title')" />

      <div :class="vertical ? 'row no-wrap items-start q-col-gutter-lg' : 'column'">
        <div :class="vertical ? 'col-auto' : 'q-mb-md'">
          <q-tabs
            v-model="tab"
            :vertical="vertical"
            dense
            no-caps
            inline-label
            outside-arrows
            mobile-arrows
            :align="vertical ? 'left' : 'justify'"
            active-color="primary"
            indicator-color="primary"
            class="settings-tabs text-muted"
          >
            <q-tab
              v-for="x in tabs"
              :key="x.name"
              :name="x.name"
              :icon="x.icon"
              :label="$t('setup.settings.tabs.' + x.name)"
            />
          </q-tabs>
        </div>

        <div class="col settings-body">
          <template v-if="tab === 'general'">
            <SettingsSection :title="$t('setup.settings.sections.network')" icon="lan">
              <serverPort />
            </SettingsSection>
            <SettingsSection :title="$t('setup.settings.sections.startup')" icon="power_settings_new">
              <autoStart />
              <startOnPlay />
            </SettingsSection>
          </template>

          <template v-else-if="tab === 'playback'">
            <SettingsSection :title="$t('setup.settings.sections.playback')" icon="play_circle">
              <imageTime />
              <BackgroundColor />
              <hardwareAccel />
            </SettingsSection>
            <SettingsSection :title="$t('setup.windows.prerollTitle')" icon="bolt">
              <PrerollSettings />
            </SettingsSection>
          </template>

          <template v-else-if="tab === 'audio'">
            <SettingsSection :title="$t('setup.settings.sections.audio')" icon="volume_up">
              <audioDevice />
            </SettingsSection>
          </template>

          <template v-else-if="tab === 'sync'">
            <SettingsSection :title="$t('setup.settings.sections.multiPcSync')" icon="sync">
              <SyncManager />
            </SettingsSection>
          </template>

          <template v-else-if="tab === 'system'">
            <SettingsSection :title="$t('setup.settings.sections.memory')" icon="memory">
              <MemoryIndicator />
            </SettingsSection>
            <SettingsSection :title="$t('setup.settings.sections.software')" icon="system_update">
              <softwareUpdate />
            </SettingsSection>
            <SettingsSection :title="$t('setup.settings.sections.maintenance')" icon="warning" danger>
              <mediaFileReset />
            </SettingsSection>
            <!-- About — 오픈소스 고지는 관례대로 눈에 띄지 않게 최하단에 배치 -->
            <div class="about-foot">
              <span>VP App</span>
              <span class="about-dot">·</span>
              <router-link class="about-link" to="/licenses">{{
                $t('setup.settings.openSourceNotice')
              }}</router-link>
            </div>
          </template>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.settings-wrap {
  max-width: 1000px;
  margin: 0 auto;
}
.settings-tabs {
  min-width: 160px;
}
.settings-body {
  min-width: 0;
}
/* 섹션 내 여러 SettingRow 사이 옅은 구분선 (SettingRow가 자체 패딩을 가짐) */
.settings-wrap :deep(.settings-section .setting-row + .setting-row) {
  border-top: 1px solid var(--border);
}
.about-foot {
  margin: 1.5rem 0 0.5rem;
  text-align: center;
  font-size: 0.72rem;
  color: var(--text-3);
}
.about-dot {
  margin: 0 0.4rem;
  opacity: 0.6;
}
.about-link {
  color: var(--text-3);
  text-decoration: none;
}
.about-link:hover {
  color: var(--text-2);
  text-decoration: underline;
}
</style>
