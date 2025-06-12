<script setup>
import imageTime from 'src/components/setup/imageTime.vue'
import BackgroundColor from 'src/components/setup/backgroundColor.vue'
import LogoSetup from 'src/components/setup/logoSetup.vue'
import audioDevice from 'src/components/setup/audioDevice.vue'
import mediaFileReset from 'src/components/setup/mediaFileReset.vue'
</script>

<template>
  <div class="q-py-sm q-px-lg">
    <q-card flat>
      <q-card-section>
        <mediaFileReset />
        <imageTime />
        <BackgroundColor />
        <q-separator class="q-my-md" />
        <LogoSetup />
        <q-separator class="q-my-md" />
        <audioDevice />
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped></style>
