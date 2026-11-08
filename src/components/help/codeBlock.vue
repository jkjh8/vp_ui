<script setup>
// 코드/명령 예시 블록 — 복사 버튼 포함. 라이트/다크는 토큰(var(--*))으로 자동 전환.
import { copyToClipboard, useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  code: { type: String, default: '' },
  label: { type: String, default: '' },
})

const $q = useQuasar()
const { t } = useI18n()

function onCopy() {
  copyToClipboard(props.code)
    .then(() => {
      $q.notify({
        message: t('help.codeBlock.copied'),
        icon: 'content_copy',
        color: 'primary',
        position: 'top',
        timeout: 1200,
      })
    })
    .catch(() => {
      $q.notify({
        message: t('help.codeBlock.copyFailed'),
        color: 'negative',
        position: 'top',
        timeout: 1500,
      })
    })
}
</script>

<template>
  <div class="code-block">
    <div v-if="label" class="code-block__label">{{ label }}</div>
    <div class="code-block__body">
      <pre class="code-block__pre"><code>{{ code }}</code></pre>
      <q-btn
        class="code-block__copy"
        flat
        dense
        round
        size="sm"
        icon="content_copy"
        @click="onCopy"
      >
        <q-tooltip>{{ $t('help.codeBlock.copy') }}</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
.code-block__label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 4px;
}
.code-block__body {
  position: relative;
}
.code-block__pre {
  margin: 0;
  padding: 10px 42px 10px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow-x: auto;
  font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--text-1);
  white-space: pre;
}
.code-block__copy {
  position: absolute;
  top: 4px;
  right: 4px;
  color: var(--text-2);
}
</style>
