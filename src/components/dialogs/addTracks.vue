<script setup>
import { useDialogPluginComponent } from 'quasar'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="dialog-card">
      <q-card-section class="row justify-between items-center">
        <div>
          <q-icon name="playlist_add" size="sm" color="primary"></q-icon>
          <span class="text-h6 q-ml-md">Add Tracks</span>
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Add your form or content for adding tracks here -->
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancel" flat @click="onDialogCancel" />
        <q-btn label="Add Tracks" color="primary" @click="onDialogOK" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
