<script setup>
import PageHeader from 'src/components/ui/PageHeader.vue'
import OpenSourceList from 'src/components/opensource/OpenSourceList.vue'
</script>

<template>
  <q-page padding>
    <div class="os-wrap">
      <PageHeader
        icon="code"
        :title="$t('opensource.openSourcePage.title')"
        :description="$t('opensource.openSourcePage.notice')"
      />
      <div class="app-card q-pa-lg">
        <OpenSourceList />
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.os-wrap {
  max-width: 900px;
  margin: 0 auto;
}
</style>
