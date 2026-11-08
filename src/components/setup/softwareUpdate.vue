<script setup>
// 웹 소프트웨어 업데이트 — 암호화 패키지(.vpu)를 올리면 서버가 복호화·검증 후 스테이징하고,
// 확인 시 적용(서버 종료 → 헬퍼가 파일 교체 → 재기동, 실패 시 자동 롤백). Node 런타임은 교체 안 함.
// 적용 후엔 서버가 잠시 내려가므로 status를 폴링해 applyId의 최종 결과를 기다린 뒤 새로고침한다.
// 백엔드: vp_app2 src/api/system/update.js · /api/system/update/*
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import SettingRow from 'src/components/ui/SettingRow.vue'
import confirmDialog from '../dialogs/confirmDialog.vue'
import { useApiStore } from 'src/stores/useApi'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const $q = useQuasar()
const { getApi } = useApiStore()

const status = ref(null)
const fileInput = ref(null)
const POLL_TIMEOUT_MS = 180000

const fetchStatus = async () => {
  const api = getApi()
  if (!api) return null
  const { data } = await api({ url: '/system/update/status', method: 'GET', timeout: 3000 })
  return data
}

const fmtAt = (iso) => (iso ? new Date(iso).toLocaleString() : '')

const caption = computed(() => {
  const s = status.value
  if (!s) return ''
  if (!s.packaged) return t('setup.softwareUpdate.notPackaged')
  if (!s.writable) return t('setup.softwareUpdate.noWrite')
  return t('setup.softwareUpdate.current', { version: s.version })
})

const lastResultText = computed(() => {
  const r = status.value?.lastResult
  if (!r || r.state === 'applying') return ''
  const args = { from: r.fromVersion, to: r.toVersion, at: fmtAt(r.at) }
  return r.state === 'success'
    ? t('setup.softwareUpdate.lastSuccess', args)
    : t('setup.softwareUpdate.lastFailed', args)
})

const canUpdate = computed(() => !!status.value?.packaged && !!status.value?.writable)

// 'x.y.z' 비교 (a>b → 1)
const cmpVersion = (a, b) => {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0)
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0) ? 1 : -1
  }
  return 0
}

const errorMessage = (e) => {
  const code = e?.response?.data?.code
  const known = ['DECRYPT_FAILED', 'BAD_PACKAGE', 'NO_WRITE_PERMISSION', 'BUSY', 'NOT_PACKAGED']
  return known.includes(code)
    ? t(`setup.softwareUpdate.errors.${code}`)
    : t('setup.softwareUpdate.errors.unknown')
}

const pickFile = () => fileInput.value?.click()

const onFileChosen = async (ev) => {
  const file = ev.target.files?.[0]
  ev.target.value = '' // 같은 파일 재선택 허용
  if (!file) return
  const api = getApi()
  const form = new FormData()
  form.append('file', file)
  let staged
  try {
    $q.loading.show({ message: t('setup.softwareUpdate.uploading', { pct: 0 }) })
    const { data } = await api({
      url: '/system/update/upload',
      method: 'POST',
      data: form,
      timeout: 0,
      onUploadProgress: (p) => {
        const pct = p.total ? Math.round((p.loaded / p.total) * 100) : 0
        $q.loading.show({
          message:
            pct >= 100
              ? t('setup.softwareUpdate.verifying')
              : t('setup.softwareUpdate.uploading', { pct }),
        })
      },
    })
    staged = data.staged
  } catch (e) {
    console.error('update upload failed:', e)
    $q.notify({ type: 'negative', message: errorMessage(e) })
    return
  } finally {
    $q.loading.hide()
  }

  const from = status.value?.version
  const newer = cmpVersion(staged.version, from) > 0
  $q.dialog({
    component: confirmDialog,
    componentProps: {
      title: t('setup.softwareUpdate.confirmTitle'),
      message: newer
        ? t('setup.softwareUpdate.confirmMessage', { from, to: staged.version })
        : t('setup.softwareUpdate.confirmDowngrade', { from, to: staged.version }),
      danger: !newer,
    },
  })
    .onOk(() => apply())
    .onCancel(async () => {
      try {
        await api({ url: '/system/update', method: 'DELETE' })
      } catch (e) {
        console.error('update cancel failed:', e)
      }
    })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const apply = async () => {
  const api = getApi()
  $q.loading.show({ message: t('setup.softwareUpdate.applying') })
  let applyId
  try {
    const { data } = await api({ url: '/system/update/apply', method: 'POST' })
    applyId = data.applyId
  } catch (e) {
    $q.loading.hide()
    $q.notify({ type: 'negative', message: errorMessage(e) })
    return
  }

  // 서버 재기동 대기 — 내려가 있는 동안의 요청 실패는 무시하고 최종 결과까지 폴링
  const until = Date.now() + POLL_TIMEOUT_MS
  await sleep(2000)
  while (Date.now() < until) {
    let s = null
    try {
      s = await fetchStatus()
    } catch {
      /* 재기동 중 */
    }
    const r = s?.lastResult
    if (r?.id === applyId && r.state !== 'applying') {
      $q.loading.hide()
      status.value = s
      if (r.state === 'success') {
        $q.notify({ type: 'positive', message: t('setup.softwareUpdate.success', { version: s.version }) })
        setTimeout(() => window.location.reload(), 1200) // 새 버전 SPA 로드
      } else {
        const key = r.state === 'rolled_back' ? 'rolledBack' : 'failed'
        $q.notify({
          type: 'negative',
          timeout: 0,
          closeBtn: true,
          message: t(`setup.softwareUpdate.${key}`, { error: r.error || '' }),
        })
      }
      return
    }
    await sleep(1500)
  }
  $q.loading.hide()
  $q.notify({ type: 'warning', timeout: 0, closeBtn: true, message: t('setup.softwareUpdate.timeout') })
}

onMounted(async () => {
  try {
    status.value = await fetchStatus()
  } catch (e) {
    console.error('update status failed:', e)
  }
})
</script>

<template>
  <SettingRow icon="system_update" :label="$t('setup.softwareUpdate.title')" :caption="caption">
    <template v-if="lastResultText" #caption>
      <div>{{ caption }}</div>
      <div :class="status.lastResult.state === 'success' ? '' : 'text-negative'">
        {{ lastResultText }}
      </div>
    </template>
    <template #control>
      <input ref="fileInput" type="file" accept=".vpu" class="hidden" @change="onFileChosen" />
      <q-btn
        unelevated
        color="primary"
        icon="upload_file"
        :label="$t('setup.softwareUpdate.choose')"
        :disable="!canUpdate"
        @click="pickFile"
      />
    </template>
  </SettingRow>
</template>

<style scoped></style>
