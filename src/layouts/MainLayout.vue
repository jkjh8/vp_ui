<script setup>
import { useRouter } from 'vue-router'
import MenuFull from 'components/menu/menuFull.vue'
import MenuSmall from 'components/menu/menuSmall.vue'
import PlayControl from 'components/controls/PlayControl.vue'
const router = useRouter()
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="header row no-wrap justify-between items-center">
      <div class="row q-gutter-x-sm pointer" @click="router.push('/')">
        <q-icon name="svguse:icons.svg#logo" size="md" />
        <div class="header-font">Player Controls</div>
      </div>
      <!-- Menu Components -->
      <MenuFull class="gt-xs" />
      <MenuSmall class="lt-sm" />
      <!-- <UserStatus /> -->
    </q-header>

    <q-page-container>
      <div class="router-view">
        <router-view />
      </div>
    </q-page-container>

    <q-footer class="footer">
      <PlayControl />
    </q-footer>
  </q-layout>
</template>

<style scoped></style>
