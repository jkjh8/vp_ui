import { ref, computed, watch } from 'vue'
import { usePlayback } from 'src/composables/usePlayback'

// 마스터 볼륨 슬라이더 로컬 상태 (MasterVolume 컴포넌트용).
// 드래그 중 live(전송만), 놓으면 persist(저장), 소켓 푸시로 동기화(드래그 중 제외).
// 플레이어 출력 버스 최종단(임베디드+추가 오디오 합산 후)에 적용된다.
export function useMasterVolume() {
  const { masterVolume, setMasterVolume } = usePlayback()

  const vol = ref(masterVolume.value)
  let dragging = false

  watch(masterVolume, (v) => {
    if (!dragging && Number.isFinite(v)) vol.value = v
  })

  const volIcon = computed(() =>
    vol.value === 0 ? 'volume_off' : vol.value < 50 ? 'volume_down' : 'volume_up',
  )

  const onDrag = (v) => {
    dragging = true
    vol.value = v
    setMasterVolume(v, { live: true })
  }
  const onChange = (v) => {
    dragging = false
    setMasterVolume(v, { live: false })
  }

  return { vol, volIcon, onDrag, onChange }
}
