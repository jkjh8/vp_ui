import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStatusStore } from 'src/stores/useStatus'
import { useApiStore } from 'src/stores/useApi'

// 멀티 PC 마스터 콘솔 파사드.
// 발견된 플레이어 목록·쇼 구성·동기 재생 트리거를 단일 진입점으로 제공하고,
// 원격 슬레이브 조작은 fleet 리버스 프록시(getApi(playerId))로 라우팅한다.
export function useFleet() {
  const statusStore = useStatusStore()
  const { pStatus } = storeToRefs(statusStore)
  const { getApi } = useApiStore()

  const api = () => getApi() // 로컬(master) 백엔드 — baseURL .../api

  const role = computed(() => pStatus.value.sync?.role || 'standalone')
  const isMaster = computed(() => role.value === 'master')
  const selfId = computed(() => pStatus.value.sync?.playerId || '')

  // 발견된 플레이어 (이름 정렬). online/offline 모두 포함(오프라인은 배지로 구분).
  const players = computed(() =>
    Object.values(pStatus.value.sync?.discovered || {}).sort((a, b) =>
      String(a.name || '').localeCompare(String(b.name || '')),
    ),
  )
  const onlinePlayers = computed(() => players.value.filter((p) => p.online))
  const show = computed(() => pStatus.value.sync?.show || {})

  const refresh = async () => (await api().post('/fleet/refresh')).data
  const saveShow = async (patch) => (await api().post('/fleet/show', patch)).data
  const playShow = async () => (await api().post('/fleet/show/play')).data
  const stopShow = async () => (await api().post('/fleet/show/stop')).data
  // 플레이어 간 PTP 클럭 오프셋 진단 → { players:[{name,synced,offsetNs,rttMs}], at }
  const diag = async () => (await api().get('/fleet/diag')).data

  // 원격 슬레이브 REST (프록시) — 기존 컴포저블/엔드포인트를 그대로 슬레이브에 적용
  const playerApi = (id) => getApi(id)
  const fetchPlaylists = async (id) => {
    try {
      const res = await getApi(id).get('/playlist')
      const d = res?.data
      if (Array.isArray(d)) return d
      return d?.playlists || []
    } catch {
      return []
    }
  }

  return {
    role,
    isMaster,
    selfId,
    players,
    onlinePlayers,
    show,
    refresh,
    saveShow,
    playShow,
    stopShow,
    diag,
    playerApi,
    fetchPlaylists,
  }
}
