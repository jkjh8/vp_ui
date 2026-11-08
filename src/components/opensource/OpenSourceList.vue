<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import licenses from 'src/docs/licenses'

const { t } = useI18n()

// SPDX → 배지색
const badgeColor = (spdx) => {
  if (spdx.startsWith('Apache')) return 'info'
  if (spdx.startsWith('LGPL') || spdx.startsWith('GPL')) return 'warning'
  if (spdx.startsWith('OFL') || spdx.includes('Public Domain')) return 'positive'
  return 'grey-6' // MIT 등 중립
}

const sections = computed(() => [
  { key: 'frontend', title: t('opensource.openSourceList.frontend'), items: licenses.frontend },
  { key: 'backend', title: t('opensource.openSourceList.backend'), items: licenses.backend },
  { key: 'player', title: t('opensource.openSourceList.player'), items: licenses.player },
])
</script>

<template>
  <div>
    <div v-for="section in sections" :key="section.key" class="q-mb-lg">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ section.title }}</div>
      <q-expansion-item
        v-for="(lib, i) in section.items"
        :key="`${section.key}-${i}`"
        class="lib-item q-mb-xs"
        header-class="lib-header"
      >
        <template #header>
          <q-item-section>
            <div class="row items-center q-gutter-x-sm">
              <span class="text-weight-medium">{{ lib.name }}</span>
              <span class="text-caption text-muted">{{ lib.version }}</span>
            </div>
          </q-item-section>
          <q-item-section side>
            <q-badge :color="badgeColor(lib.license)" outline :label="lib.license" />
          </q-item-section>
        </template>
        <div class="q-pa-md">
          <div class="text-body2 q-mb-sm">{{ lib.description }}</div>
          <a :href="lib.repository" target="_blank" rel="noopener" class="text-primary">
            {{ lib.repository }}
          </a>
          <pre class="license-text q-mt-md">{{ lib.text }}</pre>
        </div>
      </q-expansion-item>
    </div>

    <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ $t('opensource.openSourceList.notices') }}</div>
    <div v-for="(n, i) in licenses.notices" :key="`notice-${i}`" class="notice q-mb-sm">
      <div class="text-weight-medium">{{ n.title }}</div>
      <div class="text-body2 text-muted">{{ n.body }}</div>
    </div>
  </div>
</template>

<style scoped>
.lib-item {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-1);
}
.license-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 11px;
  background: var(--surface-2);
  color: var(--text-2);
  padding: 12px;
  border-radius: var(--radius-sm);
  max-height: 320px;
  overflow-y: auto;
}
.notice {
  padding: 0.6rem 0.8rem;
  border-left: 3px solid var(--accent);
  background: var(--surface-2);
  border-radius: var(--radius-sm);
}
</style>
