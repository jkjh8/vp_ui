<script setup>
import { computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { humanReadableFileSize } from 'src/composables/useUtils'
const { dialogRef, onDialogOK } = useDialogPluginComponent()

const props = defineProps({
  title: {
    type: String,
    default: 'Metadata',
  },
  metadata: {
    type: Object,
    default: () => ({}),
  },
})

// 필요한 항목만 추출 (format, mimetype, audio format, video format)
const filteredMeta = computed(() => {
  const meta = props.metadata || {}
  const result = {}

  // format
  if (meta.format) result.format = meta.format

  // mimetype (format.format_name 또는 format.format_long_name 또는 직접)
  if (meta.mimetype) result.mimetype = meta.mimetype
  else if (meta.format && meta.format.format_name) result.mimetype = meta.format.format_name

  // streams에서 audio, video format
  if (Array.isArray(meta.streams)) {
    const audio = meta.streams.find((s) => s.codec_type === 'audio')
    const video = meta.streams.find((s) => s.codec_type === 'video')
    if (audio)
      result['audio format'] = {
        codec_name: audio.codec_name,
        codec_long_name: audio.codec_long_name,
        profile: audio.profile,
        sample_rate: audio.sample_rate,
        channels: audio.channels,
        channel_layout: audio.channel_layout,
        bit_rate: audio.bit_rate,
        ...(audio.tags ? { tags: audio.tags } : {}),
      }
    if (video)
      result['video format'] = {
        codec_name: video.codec_name,
        codec_long_name: video.codec_long_name,
        profile: video.profile,
        width: video.width,
        height: video.height,
        pix_fmt: video.pix_fmt,
        bit_rate: video.bit_rate,
        ...(video.tags ? { tags: video.tags } : {}),
      }
  }

  return result
})
</script>

<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="meta-dialog-card">
      <q-card-section>
        <div class="row items-center q-pa-md">
          <q-icon name="info" color="primary" size="sm" class="q-mr-sm" />
          <div class="text-h6">{{ props.title }}</div>
        </div>
      </q-card-section>

      <q-card-section class="meta-scroll-area">
        <div v-if="Object.keys(filteredMeta).length">
          <!-- format -->
          <template v-if="filteredMeta.format">
            <div class="q-mb-sm text-primary" style="font-weight: bold">format</div>
            <div class="q-ml-md q-mb-md">
              <div
                v-for="(v, k) in filteredMeta.format"
                :key="'format-' + k"
                class="row items-start q-mb-xs"
              >
                <div class="text-primary" style="min-width: 120px; word-break: break-all">
                  {{ k }}
                </div>
                <div class="q-ml-sm" style="word-break: break-all; white-space: pre-line">
                  <!-- filename 항목이면 파일명만 표시 -->
                  <template v-if="k === 'filename'">
                    {{ props.title }}
                  </template>
                  <template v-else-if="k === 'tags' && typeof v === 'object' && v">
                    <div class="q-ml-md">
                      <div
                        v-for="(tv, tk) in v"
                        :key="'format-tags-' + tk"
                        class="row items-start q-mb-xs"
                      >
                        <div class="text-primary" style="min-width: 100px; word-break: break-all">
                          {{ tk }}
                        </div>
                        <div class="q-ml-sm" style="word-break: break-all; white-space: pre-line">
                          {{ tv }}
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="k === 'size' && typeof v === 'number'">
                    <!-- size 항목이면 humanReadableFileSize 적용 -->
                    {{ humanReadableFileSize(v) }}
                  </template>
                  <template v-else>
                    <!-- 숫자면 1000단위 콤마, 아니면 그대로 -->
                    {{ typeof v === 'number' ? v.toLocaleString() : v }}
                  </template>
                </div>
              </div>
            </div>
          </template>
          <!-- mimetype -->
          <template v-if="filteredMeta.mimetype">
            <div class="q-mb-sm text-primary" style="font-weight: bold">mimetype</div>
            <div class="q-ml-md q-mb-md">
              <div class="row items-start q-mb-xs">
                <div class="text-primary" style="min-width: 120px; word-break: break-all">
                  value
                </div>
                <div class="q-ml-sm" style="word-break: break-all; white-space: pre-line">
                  {{ filteredMeta.mimetype }}
                </div>
              </div>
            </div>
          </template>
          <!-- audio format -->
          <template v-if="filteredMeta['audio format']">
            <div class="q-mb-sm text-primary" style="font-weight: bold">audio format</div>
            <div class="q-ml-md q-mb-md">
              <div
                v-for="(v, k) in filteredMeta['audio format']"
                :key="'audio-' + k"
                class="row items-start q-mb-xs"
              >
                <div class="text-primary" style="min-width: 120px; word-break: break-all">
                  {{ k }}
                </div>
                <div class="q-ml-sm" style="word-break: break-all; white-space: pre-line">
                  <template v-if="k === 'tags' && typeof v === 'object' && v">
                    <div class="q-ml-md">
                      <div
                        v-for="(tv, tk) in v"
                        :key="'audio-tags-' + tk"
                        class="row items-start q-mb-xs"
                      >
                        <div class="text-primary" style="min-width: 100px; word-break: break-all">
                          {{ tk }}
                        </div>
                        <div class="q-ml-sm" style="word-break: break-all; white-space: pre-line">
                          {{ tv }}
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <!-- 숫자면 1000단위 콤마, 아니면 그대로 -->
                    {{ typeof v === 'number' ? v.toLocaleString() : v }}
                  </template>
                </div>
              </div>
            </div>
          </template>
          <!-- video format -->
          <template v-if="filteredMeta['video format']">
            <div class="q-mb-sm text-primary" style="font-weight: bold">video format</div>
            <div class="q-ml-md q-mb-md">
              <div
                v-for="(v, k) in filteredMeta['video format']"
                :key="'video-' + k"
                class="row items-start q-mb-xs"
              >
                <div class="text-primary" style="min-width: 120px; word-break: break-all">
                  {{ k }}
                </div>
                <div class="q-ml-sm" style="word-break: break-all; white-space: pre-line">
                  <template v-if="k === 'tags' && typeof v === 'object' && v">
                    <div class="q-ml-md">
                      <div
                        v-for="(tv, tk) in v"
                        :key="'video-tags-' + tk"
                        class="row items-start q-mb-xs"
                      >
                        <div class="text-primary" style="min-width: 100px; word-break: break-all">
                          {{ tk }}
                        </div>
                        <div class="q-ml-sm" style="word-break: break-all; white-space: pre-line">
                          {{ tv }}
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <!-- 숫자면 1000단위 콤마, 아니면 그대로 -->
                    {{ typeof v === 'number' ? v.toLocaleString() : v }}
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div v-else>
          <em class="text-grey">표시할 메타데이터가 없습니다.</em>
        </div>
      </q-card-section>

      <q-card-actions class="justify-end q-pa-md q-mr-md">
        <q-btn round icon="check" color="primary" size="sm" @click="onDialogOK" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.meta-dialog-card {
  width: 50vw;
  max-width: 800px;
  min-width: 320px;
  height: 70vh;
  max-height: 80em;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1.5px solid #e0e0e0; /* 테두리 추가 */
}
.meta-scroll-area {
  flex: 1 1 0;
  min-height: 0;
  max-height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #bbb #fff;
}
.meta-scroll-area::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}
.meta-scroll-area:hover::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 4px;
}
.meta-scroll-area::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
}
</style>
