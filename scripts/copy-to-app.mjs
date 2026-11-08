// 빌드된 SPA(dist/spa)를 vp_app2가 서빙하는 위치(../vp_app2/public/spa)로 복사한다.
// vp_app2는 app.getAppPath()/public/spa 를 정적 서빙하므로(개발=cwd), 여기로 복사해야
// dev/배포 양쪽에서 최신 UI가 반영된다. `npm run build:app` 에서 quasar build 후 실행.
import { cpSync, rmSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..', 'dist', 'spa')
const dest = join(here, '..', '..', 'vp_app2', 'public', 'spa')

if (!existsSync(src)) {
  console.error(`[copy-to-app] dist/spa 없음 — 먼저 quasar build 를 실행하세요: ${src}`)
  process.exit(1)
}

rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
console.log(`[copy-to-app] copied\n  ${src}\n  → ${dest}`)
