<script setup>
import FilesHeader from 'src/components/files/filesHeader.vue'
import FilesList from 'src/components/files/filesList.vue'
</script>

<template>
  <div class="q-pa-md">
    <q-card flat>
      <q-card-section class="q-py-none">
        <FilesHeader />
      </q-card-section>
      <q-card-section class="q-py-xs">
        <FilesList />
      </q-card-section>
      <q-card-section>
        <!-- File list will go here -->
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped></style>
