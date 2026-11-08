<script setup>
import { computed, ref } from 'vue'
import terminalGuide from 'src/docs/terminalGuide'
import CodeBlock from './codeBlock.vue'

const guide = terminalGuide

// 카테고리별 명령 그룹핑 (비어있는 카테고리는 제외)
const groupedCommands = computed(() =>
  guide.categories
    .map((cat) => ({
      ...cat,
      commands: guide.commands.filter((c) => c.category === cat.key),
    }))
    .filter((g) => g.commands.length > 0),
)

// 클라이언트 예제 탭 (Node.js / Python)
const exampleTab = ref(guide.examples[0]?.lang || '')
</script>

<template>
  <div class="help-content">
    <!-- ── 연결 정보 ─────────────────────────────────────── -->
    <section class="q-mb-lg">
      <div class="section-title">
        <q-icon name="cable" size="sm" color="primary" />
        <span>{{ $t('help.content.connectionInfo') }}</span>
      </div>
      <p class="text-muted q-mb-md">{{ guide.overview.description }}</p>

      <div class="row q-col-gutter-md">
        <div v-for="p in guide.overview.ports" :key="p.port" class="col-12 col-md-6">
          <div class="port-card">
            <div class="row items-center justify-between no-wrap">
              <div class="port-card__name">{{ p.name }}</div>
              <q-chip dense square color="primary" text-color="white" class="port-card__port">
                {{ p.port }}
              </q-chip>
            </div>
            <div class="text-muted q-mt-xs">{{ $t('help.content.formatLabel') }}: {{ p.format }}</div>
            <div class="text-faint text-caption q-mt-xs">{{ p.note }}</div>
          </div>
        </div>
      </div>

      <div class="row q-gutter-sm q-mt-md">
        <q-chip dense square outline icon="lan" :label="guide.overview.protocol" />
        <q-chip
          v-if="guide.overview.protocolVersion"
          dense
          square
          color="primary"
          text-color="white"
          icon="hub"
          :label="`Protocol v${guide.overview.protocolVersion}`"
        />
        <q-chip dense square outline icon="sell" :label="`App v${guide.overview.version}`" />
        <q-chip dense square outline icon="update" :label="guide.overview.lastUpdated" />
      </div>
      <div
        v-if="guide.overview.capabilityNote"
        class="text-caption text-faint q-mt-sm row items-start no-wrap q-gutter-x-xs"
      >
        <q-icon name="handshake" size="xs" class="q-mt-xs" />
        <span>{{ guide.overview.capabilityNote }}</span>
      </div>
    </section>

    <!-- ── 명령어 형식 ───────────────────────────────────── -->
    <section class="q-mb-lg">
      <div class="section-title">
        <q-icon name="terminal" size="sm" color="primary" />
        <span>{{ $t('help.content.commandFormat') }}</span>
      </div>
      <div class="row q-col-gutter-md">
        <div v-for="fmt in guide.commandFormat" :key="fmt.type" class="col-12 col-md-6">
          <div class="app-card q-pa-md fit">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-weight-bold">{{ fmt.title }}</div>
              <q-chip dense square color="primary" text-color="white">:{{ fmt.port }}</q-chip>
            </div>
            <div class="text-muted q-mb-sm">{{ fmt.description }}</div>
            <CodeBlock :label="$t('help.content.formatLabel')" :code="fmt.format" />
            <div class="text-caption text-faint q-mt-sm q-mb-xs">{{ $t('help.content.examples') }}</div>
            <div class="format-examples">
              <code v-for="(ex, i) in fmt.examples" :key="i" class="inline-code">{{ ex }}</code>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 명령어 레퍼런스 ───────────────────────────────── -->
    <section class="q-mb-lg">
      <div class="section-title">
        <q-icon name="menu_book" size="sm" color="primary" />
        <span>{{ $t('help.content.commandReference') }}</span>
      </div>

      <q-list class="cmd-groups">
        <q-expansion-item
          v-for="group in groupedCommands"
          :key="group.key"
          default-opened
          :icon="group.icon"
          header-class="cmd-group__header text-weight-medium"
        >
          <template #header>
            <q-item-section avatar>
              <q-icon :name="group.icon" color="primary" />
            </q-item-section>
            <q-item-section>{{ group.label }}</q-item-section>
            <q-item-section side>
              <q-badge color="primary" outline :label="group.commands.length" />
            </q-item-section>
          </template>

          <div class="cmd-group__body">
            <div v-for="cmd in group.commands" :key="cmd.name" class="cmd-row">
              <div class="row items-center q-gutter-x-xs">
                <code class="cmd-name">{{ cmd.name }}</code>
                <span v-for="a in cmd.aliases || []" :key="a" class="cmd-alias">{{ a }}</span>
              </div>
              <div class="text-body2 q-mt-xs">{{ cmd.description }}</div>

              <div v-if="cmd.params && cmd.params.length" class="q-mt-sm">
                <div v-for="p in cmd.params" :key="p.name" class="param-line">
                  <code class="param-name">{{ p.name }}</code>
                  <span class="param-type">{{ p.type }}</span>
                  <span :class="['param-flag', p.required ? 'is-req' : 'is-opt']">
                    {{ p.required ? $t('help.content.required') : $t('help.content.optional') }}
                  </span>
                  <span class="text-muted">— {{ p.description }}</span>
                </div>
              </div>

              <div class="row q-col-gutter-sm q-mt-sm">
                <div class="col-12 col-md-6">
                  <CodeBlock :label="$t('help.content.simpleLabel')" :code="cmd.simple" />
                </div>
                <div class="col-12 col-md-6">
                  <CodeBlock :label="$t('help.content.jsonLabel')" :code="cmd.json" />
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </q-list>
    </section>

    <!-- ── 이벤트 브로드캐스트 ───────────────────────────── -->
    <section class="q-mb-lg">
      <div class="section-title">
        <q-icon name="podcasts" size="sm" color="primary" />
        <span>{{ $t('help.content.eventBroadcast') }}</span>
      </div>
      <p class="text-muted q-mb-md">
        서버는 상태가 바뀔 때 연결된 모든 클라이언트에 이벤트를 자동 전송합니다. (요청 없이 수신)
      </p>
      <div class="app-card q-pa-sm">
        <div class="row q-col-gutter-x-md q-col-gutter-y-sm">
          <div v-for="ev in guide.events" :key="ev.type" class="col-12 col-md-6">
            <div class="event-row">
              <code class="event-type">{{ ev.type }}</code>
              <span class="text-muted">{{ ev.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 응답 형식 ─────────────────────────────────────── -->
    <section class="q-mb-lg">
      <div class="section-title">
        <q-icon name="data_object" size="sm" color="primary" />
        <span>{{ $t('help.content.responseFormat') }}</span>
      </div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <CodeBlock :label="$t('help.content.successResponse')" :code="guide.responseFormat.success" />
        </div>
        <div class="col-12 col-md-4">
          <CodeBlock :label="$t('help.content.errorResponse')" :code="guide.responseFormat.error" />
        </div>
        <div class="col-12 col-md-4">
          <CodeBlock :label="$t('help.content.event')" :code="guide.responseFormat.event" />
        </div>
      </div>
    </section>

    <!-- ── 클라이언트 예제 (Node.js · Python 탭 전환) ─────── -->
    <section class="q-mb-lg">
      <div class="section-title">
        <q-icon name="code" size="sm" color="primary" />
        <span>{{ $t('help.content.clientExamples') }}</span>
      </div>
      <div class="app-card">
        <q-tabs
          v-model="exampleTab"
          dense
          no-caps
          align="left"
          active-color="primary"
          indicator-color="primary"
          class="text-muted example-tabs"
        >
          <q-tab v-for="ex in guide.examples" :key="ex.lang" :name="ex.lang" :label="ex.lang" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="exampleTab" animated class="example-panels">
          <q-tab-panel v-for="ex in guide.examples" :key="ex.lang" :name="ex.lang" class="q-pa-md">
            <CodeBlock :code="ex.code" />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </section>

    <!-- ── 문제 해결 ─────────────────────────────────────── -->
    <section>
      <div class="section-title">
        <q-icon name="help_outline" size="sm" color="primary" />
        <span>{{ $t('help.content.troubleshooting') }}</span>
      </div>
      <q-list bordered class="trouble-list">
        <q-expansion-item
          v-for="(t, i) in guide.troubleshooting"
          :key="i"
          :label="t.issue"
          icon="error_outline"
          header-class="text-weight-medium"
        >
          <div class="q-px-md q-py-sm text-muted">{{ t.solution }}</div>
        </q-expansion-item>
      </q-list>
    </section>
  </div>
</template>

<style scoped>
.help-content {
  max-width: 1100px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-1);
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

/* 연결 정보 카드 */
.port-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  height: 100%;
}
.port-card__name {
  font-weight: 600;
  color: var(--text-1);
}
.port-card__port {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-weight: 600;
}

/* 형식 예시 인라인 코드 */
.format-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.inline-code {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.78rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 2px 8px;
  color: var(--text-1);
}

/* 명령어 그룹 */
.cmd-groups {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-1);
}
.cmd-groups :deep(.q-expansion-item + .q-expansion-item) {
  border-top: 1px solid var(--border);
}
.cmd-group__body {
  background: var(--surface-0);
  padding: 4px 12px 12px;
}
.cmd-row {
  padding: 14px 4px;
}
.cmd-row + .cmd-row {
  border-top: 1px dashed var(--border);
}
.cmd-name {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--accent);
  background: var(--accent-weak);
  border-radius: var(--radius-sm);
  padding: 2px 8px;
}
.cmd-alias {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.72rem;
  color: var(--text-3);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
}
.cmd-alias::before {
  content: 'alias ';
  color: var(--text-3);
  opacity: 0.7;
}

/* 파라미터 */
.param-line {
  font-size: 0.8rem;
  line-height: 1.7;
}
.param-name {
  font-family: 'Fira Code', 'Consolas', monospace;
  color: var(--text-1);
  font-weight: 600;
}
.param-type {
  font-family: 'Fira Code', 'Consolas', monospace;
  color: var(--audio);
  margin: 0 6px;
}
.param-flag {
  font-size: 0.68rem;
  border-radius: var(--radius-pill);
  padding: 1px 8px;
  margin-right: 4px;
}
.param-flag.is-req {
  color: #b42318;
  background: rgba(180, 35, 24, 0.1);
}
.param-flag.is-opt {
  color: var(--text-2);
  background: var(--surface-3);
}

/* 이벤트 */
.event-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}
.event-type {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.8rem;
  color: var(--accent);
  background: var(--accent-weak);
  border-radius: var(--radius-sm);
  padding: 2px 8px;
  white-space: nowrap;
}

.trouble-list {
  border-radius: var(--radius-lg);
  border-color: var(--border);
}

/* 예제 탭 — 카드 배경에 자연스럽게 녹이기 */
.example-tabs {
  padding: 0 6px;
}
.example-panels,
.example-panels :deep(.q-tab-panel) {
  background: transparent;
}
</style>
