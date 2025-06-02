<script setup>
import { ref } from 'vue'
import playlistHeader from 'src/components/playlists/playlistHeader.vue'
import playlistView from 'src/components/playlists/playlistView.vue'
import listView from 'src/components/playlists/listView.vue'

const splitterModel = ref(50) // 기본값 50% (좌우 동일)
</script>

<template>
  <div class="q-pa-md">
    <q-card flat>
      <q-card-section>
        <playlistHeader />
      </q-card-section>
      <q-card-section>
        <q-splitter v-model="splitterModel" separator-style="background-color: #fff">
          <template v-slot:before>
            <div class="q-pr-sm">
              <playlistView />
            </div>
          </template>

          <template v-slot:after>
            <div class="">
              <listView />
            </div>
          </template>
        </q-splitter>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped></style>
