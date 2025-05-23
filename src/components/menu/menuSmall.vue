<script setup></script>

<template>
  <div class="q-gutter-x-md" style="padding-top: 5px">
    <q-btn style="border-radius: 10px" flat icon="menu" color="grey-8">
      <q-menu>
        <q-list separator style="min-width: 150px">
          <!-- <q-item clickable to="/playlist">
            <q-item-section> PLAYLIST </q-item-section>
          </q-item> -->
          <q-item clickable to="/files">
            <q-item-section avatar>
              <q-icon name="folder" size="sm" color="yellow" />
            </q-item-section>
            <q-item-section> FILES </q-item-section>
          </q-item>

          <q-item clickable to="/playlist">
            <q-item-section avatar>
              <q-icon name="list" size="sm" color="blue-10" />
            </q-item-section>
            <q-item-section> PLAYLIST </q-item-section>
          </q-item>

          <q-item clickable to="/setup">
            <q-item-section avatar>
              <q-icon name="settings" size="sm" color="grey-8" />
            </q-item-section>
            <q-item-section> SETUP </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<style scoped></style>
