<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar, useDialogPluginComponent } from 'quasar'
import DelayedTooltip from '../delayedTooltip.vue'
import updateLogoFile from '../dialogs/updateLogoFile.vue'
import { useApiStore } from 'src/stores/useApi'
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const { getAddr, getApi, apiCallWithLoading } = useApiStore()
const $q = useQuasar()
const logoFiles = ref([])
const selected = ref(null)

const props = defineProps({
  logo: {
    type: String,
  },
})

const openDialogFileUpload = () => {
  $q.dialog({
    component: updateLogoFile,
    componentProps: {
      logoFiles: logoFiles.value,
    },
    persistent: true,
  })
    .onOk(async () => {
      await getLogoFiles()
    })
    .onCancel(() => {
      console.log('File upload dialog cancelled')
    })
}

const getLogoFiles = async () => {
  await apiCallWithLoading(async () => {
    const response = await getApi().get('/status/logo')
    logoFiles.value = response.data
  }, 'Fetching logo files...')
}

onMounted(async () => {
  if (props.logo) {
    selected.value = props.logo
  }
  // Fetch logo files when the component is mounted
  await getLogoFiles()
})
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="dialog-card">
      <q-card-section class="row justify-between items-center">
        <div>
          <q-icon name="public" size="sm" color="primary"></q-icon>
          <span class="q-ml-sm text-bold">Select Logo</span>
        </div>
        <div>
          <q-btn round flat color="primary" icon="upload" @click="openDialogFileUpload">
            <DelayedTooltip msg="File Upload" />
          </q-btn>
        </div>
      </q-card-section>

      <q-card-section v-if="logoFiles.length > 0">
        <q-list
          v-model="selected"
          :rows="logoFiles"
          row-key="file"
          :virtual-scroll-item-size="50"
          class="q-pa-sm"
          style="max-height: 400px; overflow-y: auto"
        >
          <q-item
            v-for="file in logoFiles"
            :key="file"
            :label="file"
            :value="file"
            clickable
            @click="selected = file"
            :active="selected === file"
            :class="selected === file ? 'bg-grey-4' : ''"
          >
            <q-item-section avatar>
              <template v-if="file && (file.endsWith('.svg') || file.endsWith('.SVG'))">
                <img
                  :src="`${getAddr()}/api/status/logo/img/${encodeURIComponent(file)}`"
                  :alt="file"
                  style="width: 50px; height: 50px; object-fit: contain"
                />
              </template>
              <template v-else>
                <q-img
                  :src="`${getAddr()}/api/status/logo/img/${encodeURIComponent(file)}`"
                  :alt="file"
                  style="width: 50px"
                />
              </template>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ file }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section v-else>
        <div class="flex flex-center">
          <q-icon name="info" size="sm" color="primary" />
          <span class="q-ml-sm">No logo files available.</span>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat round icon="cancel" color="negative" @click="onDialogCancel">
          <DelayedTooltip msg="Cancel the selection" />
        </q-btn>
        <q-btn
          flat
          round
          color="primary"
          icon="check"
          @click="onDialogOK(selected)"
          :disabled="logoFiles.length === 0"
        >
          <DelayedTooltip msg="Select the first logo file" />
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.dialog-card {
  max-width: 800px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1.5px solid #e0e0e0; /* 테두리 추가 */
}
</style>
