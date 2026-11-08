<script setup>
// 디스플레이/창 배치 시각화 캔버스. 모니터(pStatus.displays)를 축소 배치하고 그 위에 창
// (pStatus.windows)을 사각형으로 그린다. editable=true면 창을 드래그로 이동 / 우하단 핸들로
// 리사이즈하고, 놓을 때 update 이벤트로 배치를 알린다(부모가 REST 저장). 대시보드는 read-only.
import { computed, ref } from 'vue'
import { useStatusStore } from 'src/stores/useStatus'
import { storeToRefs } from 'pinia'

const props = defineProps({
  editable: { type: Boolean, default: false },
  height: { type: Number, default: 240 },
  // 지정 시 이 창 목록을 그린다(프리셋 미리보기용). 미지정이면 현재 pStatus.windows.
  windows: { type: Array, default: null },
  // 현재 플레이어가 보유한 창을 초록 테두리로 강조할지 (프리셋 미리보기에서는 끔).
  showLive: { type: Boolean, default: true },
  // true면 컨테이너 폭에 맞춰 높이를 가상 데스크톱 비율로 자동 산정 → 화면이 커지면 캔버스도 커진다.
  autoHeight: { type: Boolean, default: false },
  maxAutoHeight: { type: Number, default: 1200 },
})
const emit = defineEmits(['update'])

const { pStatus } = storeToRefs(useStatusStore())
const canvasRef = ref(null)

const displays = computed(() => pStatus.value.displays || [])
// 오디오 전용 창(화면 송출 없음)은 모니터 배치에 그리지 않는다.
const windows = computed(() =>
  (props.windows ?? (pStatus.value.windows || [])).filter((w) => !w.audioOnly),
)
const liveIds = computed(() =>
  props.showLive ? new Set((pStatus.value.playerWindows || []).map((w) => w.window_id)) : new Set(),
)

// 가상 데스크톱 경계 (모니터 없으면 1920x1080 가정)
const bounds = computed(() => {
  const d = displays.value
  if (!d.length) return { minX: 0, minY: 0, w: 1920, h: 1080 }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const m of d) {
    minX = Math.min(minX, m.x); minY = Math.min(minY, m.y)
    maxX = Math.max(maxX, m.x + m.width); maxY = Math.max(maxY, m.y + m.height)
  }
  return { minX, minY, w: maxX - minX, h: maxY - minY }
})

const PAD = 8
const canvasW = ref(600)
// autoHeight면 폭에 맞춰 가상 데스크톱 비율대로 높이를 키운다(props.height를 최소값으로). 최대 상한만 둔다.
const heightPx = computed(() => {
  if (!props.autoHeight) return props.height
  const b = bounds.value
  const aspect = b.w / b.h || 16 / 9
  const availW = Math.max(1, canvasW.value - PAD * 2)
  const h = availW / aspect + PAD * 2
  return Math.round(Math.max(props.height, Math.min(h, props.maxAutoHeight)))
})
const scale = computed(() => {
  const b = bounds.value
  const availW = canvasW.value - PAD * 2
  const availH = heightPx.value - PAD * 2
  return Math.min(availW / b.w, availH / b.h) || 0.1
})
const sx = (x) => PAD + (x - bounds.value.minX) * scale.value
const sy = (y) => PAD + (y - bounds.value.minY) * scale.value
const sl = (v) => v * scale.value

const monitorOf = (id) => displays.value.find((m) => m.index === id) || displays.value.find((m) => m.primary) || displays.value[0]
// 창의 모니터: 고정 key(재부팅해도 불변) 우선, 없으면 순번(monitorIndex)
const monitorOfWin = (w) =>
  (w.monitorKey && displays.value.find((m) => m.key === w.monitorKey)) || monitorOf(w.monitorIndex)

// 창의 화면 절대 사각형
const winRect = (w) => {
  const mon = monitorOfWin(w)
  const ox = mon ? mon.x : 0, oy = mon ? mon.y : 0
  const mw = mon ? mon.width : 1920, mh = mon ? mon.height : 1080
  const width = w.width > 0 ? w.width : mw
  const height = w.height > 0 ? w.height : mh
  return { x: ox + (w.x || 0), y: oy + (w.y || 0), width, height }
}

// 창 구분용 팔레트 — 채도를 낮춘 차분한 톤(무지개색 지양, 산만함 완화). 구분은 라벨/z로 보조.
const palette = ['#4f6b8f', '#4f7d74', '#8f7a4f', '#6b5f8f', '#5f7384', '#84677a']
const winColor = (id) => palette[((id % palette.length) + palette.length) % palette.length]

// z 순서 시각화: 낮은 z = 뒤(더 투명), 높은 z = 앞(더 불투명). 겹칠 때 앞 창이 뒤 창을 확실히 덮게.
const alphaHex = (a) => Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0')
const zRank = computed(() => {
  const sorted = [...windows.value].sort(
    (a, b) => (a.zOrder || 0) - (b.zOrder || 0) || a.id - b.id,
  )
  const map = {}
  const n = sorted.length
  sorted.forEach((w, i) => {
    map[w.id] = n > 1 ? i / (n - 1) : 1 // 0 = 맨 뒤, 1 = 맨 앞
  })
  return map
})
const winFill = (w) => winColor(w.id) + alphaHex(0.25 + 0.62 * (zRank.value[w.id] ?? 1))

// ── 드래그/리사이즈 (+ 경계 스냅) ──
const SNAP_PX = 8 // 스냅 감지 거리(캔버스 픽셀). 절대좌표 임계값 = SNAP_PX / scale.

// 스냅 기준선: 각 모니터 가장자리 + (자신 제외) 다른 창의 가장자리.
const buildSnapLines = (excludeId) => {
  const vx = [] // 세로 기준선(x)
  const hy = [] // 가로 기준선(y)
  for (const m of displays.value) {
    vx.push(m.x, m.x + m.width)
    hy.push(m.y, m.y + m.height)
  }
  for (const other of windows.value) {
    if (other.id === excludeId) continue
    const r = winRect(other)
    vx.push(r.x, r.x + r.width)
    hy.push(r.y, r.y + r.height)
  }
  return { vx, hy }
}

// 주어진 가장자리들 중 기준선에 임계값 내로 가장 가까운 것의 보정량을 반환.
const snapDelta = (edges, lines, thr) => {
  let best = 0
  let bestDist = thr
  for (const line of lines) {
    for (const edge of edges) {
      const d = line - edge
      const ad = Math.abs(d)
      if (ad < bestDist) {
        bestDist = ad
        best = d
      }
    }
  }
  return best
}

let drag = null
const onDown = (e, w, mode) => {
  if (!props.editable) return
  e.preventDefault()
  const r = winRect(w)
  drag = {
    w,
    mode,
    startX: e.clientX,
    startY: e.clientY,
    orig: r,
    lines: buildSnapLines(w.id),
    moved: false,
    cur: null,
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}
const onMove = (e) => {
  if (!drag) return
  if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) > 2) drag.moved = true
  const dxScreen = (e.clientX - drag.startX) / scale.value
  const dyScreen = (e.clientY - drag.startY) / scale.value
  const el = document.getElementById('win-' + drag.w.id)
  if (!el) return
  const thr = SNAP_PX / scale.value
  const o = drag.orig
  if (drag.mode === 'move') {
    let x = o.x + dxScreen
    let y = o.y + dyScreen
    x += snapDelta([x, x + o.width], drag.lines.vx, thr) // 좌/우 가장자리 스냅
    y += snapDelta([y, y + o.height], drag.lines.hy, thr) // 상/하 가장자리 스냅
    drag.cur = { x, y }
    el.style.left = sx(x) + 'px'
    el.style.top = sy(y) + 'px'
  } else {
    let width = Math.max(20, o.width + dxScreen)
    let height = Math.max(20, o.height + dyScreen)
    width = Math.max(20, width + snapDelta([o.x + width], drag.lines.vx, thr)) // 우측 가장자리 스냅
    height = Math.max(20, height + snapDelta([o.y + height], drag.lines.hy, thr)) // 하단 가장자리 스냅
    drag.cur = { width, height }
    el.style.width = sl(width) + 'px'
    el.style.height = sl(height) + 'px'
  }
}
const onUp = () => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  if (!drag) return
  const d = drag
  drag = null
  if (!d.moved || !d.cur) return // 이동 없이 클릭만 → 저장 안 함(불필요한 재저장 방지)
  const w = d.w
  const patch = {}
  if (d.mode === 'move') {
    const absX = Math.round(d.cur.x)
    const absY = Math.round(d.cur.y)
    // 중심이 들어가는 모니터로 재배정
    const cx = absX + d.orig.width / 2
    const cy = absY + d.orig.height / 2
    const mon =
      displays.value.find((m) => cx >= m.x && cx < m.x + m.width && cy >= m.y && cy < m.y + m.height) ||
      monitorOfWin(w)
    if (mon) {
      patch.monitorIndex = mon.index
      patch.monitorKey = mon.key || null
      patch.monitorSerial = mon.serial || null
      patch.monitorName = mon.name || null
      patch.x = Math.round(absX - mon.x)
      patch.y = Math.round(absY - mon.y)
    }
  } else {
    patch.width = Math.max(20, Math.round(d.cur.width))
    patch.height = Math.max(20, Math.round(d.cur.height))
  }
  emit('update', w.id, patch)
}

// 캔버스 폭 추적
const onResize = () => { if (canvasRef.value) canvasW.value = canvasRef.value.clientWidth }
import { onMounted, onUnmounted } from 'vue'
onMounted(() => { onResize(); window.addEventListener('resize', onResize) })
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<template>
  <div ref="canvasRef" class="layout-canvas" :style="{ height: heightPx + 'px' }">
    <!-- 모니터 -->
    <div
      v-for="m in displays"
      :key="'mon' + m.index"
      class="mon"
      :style="{ left: sx(m.x) + 'px', top: sy(m.y) + 'px', width: sl(m.width) + 'px', height: sl(m.height) + 'px' }"
    >
      <span class="mon-label">#{{ m.index }}{{ m.primary ? $t('setup.windowLayout.primarySuffix') : '' }} {{ m.width }}×{{ m.height }}</span>
    </div>
    <!-- 창 -->
    <div
      v-for="w in windows"
      :id="'win-' + w.id"
      :key="'win' + w.id"
      class="win"
      :class="{ editable, live: liveIds.has(w.id) }"
      :style="{
        left: sx(winRect(w).x) + 'px',
        top: sy(winRect(w).y) + 'px',
        width: sl(winRect(w).width) + 'px',
        height: sl(winRect(w).height) + 'px',
        borderColor: winColor(w.id),
        background: winFill(w),
        zIndex: (w.zOrder || 0) + 1,
      }"
      @pointerdown="(e) => onDown(e, w, 'move')"
    >
      <span class="win-z" :style="{ background: winColor(w.id) }">z{{ w.zOrder || 0 }}</span>
      <span class="win-label">{{ w.name }}</span>
      <div v-if="editable" class="resize-handle" @pointerdown.stop="(e) => onDown(e, w, 'resize')" />
    </div>
    <div v-if="!displays.length" class="empty">{{ $t('setup.windowLayout.noMonitors') }}</div>
  </div>
</template>

<style scoped>
.layout-canvas {
  position: relative;
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.mon {
  position: absolute;
  border: 1px dashed var(--border-strong);
  border-radius: 4px;
  background: var(--surface-0);
}
.mon-label {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 10px;
  color: var(--text-3);
}
.win {
  position: absolute;
  border: 2px solid;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  /* 겹칠 때 위 창이 아래 창 위로 떠 보이도록 그림자로 깊이감 부여 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.28);
}
.win.editable {
  cursor: move;
}
.win.live {
  box-shadow:
    0 0 0 2px var(--accent) inset,
    0 2px 10px rgba(0, 0, 0, 0.28);
}
/* z 순서 배지 — 창 좌상단에 z 값 표시(클수록 앞) */
.win-z {
  position: absolute;
  top: 3px;
  left: 3px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  padding: 2px 6px;
  border-radius: 999px;
  pointer-events: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}
.win-label {
  font-size: 11px;
  font-weight: 700;
  pointer-events: none;
  text-align: center;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  padding: 0 4px;
}
.resize-handle {
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 12px;
  height: 12px;
  background: var(--accent);
  border-radius: 2px;
  cursor: nwse-resize;
}
.empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
}
</style>
