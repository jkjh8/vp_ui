<script setup>
// Windows 시작(로그온) 시 앱 자동 실행 토글. 실체는 사용자별 레지스트리 Run 키(백엔드 reg, HKCU).
// 이 앱은 Electron이 아니라 Node 서비스라 OS 등록으로 자동실행을 제어한다. 관리자 권한 불필요.
// 비Windows/미지원 시 비활성.
import { ref, onMounted } from 'vue'
import SettingRow from 'src/components/ui/SettingRow.vue'
import InfoHint from 'src/components/ui/InfoHint.vue'
import { useQuasar } from 'quasar'
import { useStatusStore } from 'src/stores/useStatus'
import { useApiStore } from 'src/stores/useApi'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const $q = useQuasar()
const { apiCallWithLoading, getApi } = useApiStore()
const { pStatus } = storeToRefs(useStatusStore())

const supported = ref(true)

const updateAutoStart = async (value) => {
  try {
    const res = await apiCallWithLoading(
      '/system/autostart',
      'PUT',
      { value },
      t('setup.autoStart.updating'),
    )
    pStatus.value.autoStart = res?.data?.enabled ?? value
    $q.notify({ type: 'positive', message: t('setup.autoStart.updated') })
  } catch (error) {
    console.error('Error updating autoStart:', error)
    // 실패 시 토글 원복 (권한 부족 등)
    pStatus.value.autoStart = !value
    $q.notify({ type: 'negative', message: t('setup.autoStart.failed') })
  }
}

onMounted(async () => {
  // 실제 지원 여부(Windows) + 현재 의도값 동기화 (표시만, 로딩 스피너 없이)
  try {
    const api = getApi()
    if (!api) return
    const { data } = await api({ url: '/system/autostart', method: 'GET' })
    supported.value = !!data?.supported
    pStatus.value.autoStart = !!data?.enabled
  } catch (error) {
    console.error('Error fetching autoStart:', error)
  }
})
</script>

<template>
  <SettingRow
    icon="power_settings_new"
    :label="$t('setup.autoStart.title')"
    :caption="supported ? '' : $t('setup.autoStart.unsupported')"
  >
    <template #control>
      <InfoHint v-if="supported" :msg="$t('setup.autoStart.caption')" />
      <q-toggle
        v-model="pStatus.autoStart"
        color="primary"
        :disable="!supported"
        @update:model-value="updateAutoStart"
      />
    </template>
  </SettingRow>
</template>

<style scoped></style>
