/**
 * 오픈소스 라이선스 정보
 * 구조: { frontend[], backend[], player[], notices[] }
 * 각 항목: { name, version, license(SPDX), description, repository, text }
 * 라이선스 전문은 종류별로 공유(TEXT)한다.
 */

const MIT = `MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`

const APACHE2 =
  'Apache License 2.0 — 전문: https://www.apache.org/licenses/LICENSE-2.0\n' +
  '본 배포물은 해당 라이브러리의 NOTICE 고지를 포함합니다.'

const LGPL21 =
  'GNU Lesser General Public License v2.1 (or later) — 전문: https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html\n' +
  'GStreamer 및 vendored gstasio 플러그인은 동적 링크로 사용되며, 라이브러리 소스 및 COPYING.LIB 전문을 함께 제공합니다.'

const OFL11 =
  'SIL Open Font License 1.1 — 전문: https://openfontlicense.org\n' +
  'NanumGothic 폰트에 적용됩니다.'

const PD = 'Public Domain (Unlicense) 또는 MIT 이중 라이선스.'

export const licenses = {
  frontend: [
    { name: 'Vue', version: '^3.4.18', license: 'MIT', description: '프로그레시브 자바스크립트 프레임워크', repository: 'https://github.com/vuejs/core', text: MIT },
    { name: 'Quasar Framework', version: '^2.16.0', license: 'MIT', description: 'Vue 기반 UI 프레임워크', repository: 'https://github.com/quasarframework/quasar', text: MIT },
    { name: 'Pinia', version: '^3.0.1', license: 'MIT', description: 'Vue 상태 관리 스토어', repository: 'https://github.com/vuejs/pinia', text: MIT },
    { name: 'Vue Router', version: '^4.0.0', license: 'MIT', description: 'Vue 공식 라우터', repository: 'https://github.com/vuejs/router', text: MIT },
    { name: 'Axios', version: '^1.2.1', license: 'MIT', description: 'Promise 기반 HTTP 클라이언트', repository: 'https://github.com/axios/axios', text: MIT },
    { name: 'socket.io-client', version: '^4.8.1', license: 'MIT', description: '실시간 양방향 통신 클라이언트', repository: 'https://github.com/socketio/socket.io', text: MIT },
    { name: 'vuedraggable', version: '^4.1.0', license: 'MIT', description: 'SortableJS 기반 드래그앤드롭', repository: 'https://github.com/SortableJS/vue.draggable.next', text: MIT },
    { name: 'sass-embedded', version: '^1.89.0', license: 'MIT', description: 'Dart Sass 임베디드 컴파일러(빌드)', repository: 'https://github.com/sass/embedded-host-node', text: MIT },
    { name: 'Roboto (font)', version: '—', license: 'Apache-2.0', description: '기본 UI 폰트', repository: 'https://github.com/googlefonts/roboto', text: APACHE2 },
    { name: 'Material Icons (font)', version: '—', license: 'Apache-2.0', description: '아이콘 세트', repository: 'https://github.com/google/material-design-icons', text: APACHE2 },
    { name: 'NanumGothic (font)', version: '—', license: 'OFL-1.1', description: '한글 본문 폰트 (© NAVER Corp.)', repository: 'https://hangeul.naver.com', text: OFL11 },
  ],
  backend: [
    { name: 'Express', version: '^5.1.0', license: 'MIT', description: 'Node.js 웹 프레임워크', repository: 'https://github.com/expressjs/express', text: MIT },
    { name: 'socket.io', version: '^4.8.1', license: 'MIT', description: '실시간 양방향 통신 서버', repository: 'https://github.com/socketio/socket.io', text: MIT },
    { name: 'nedb-promises', version: '^6.2.3', license: 'MIT', description: '임베디드 문서 DB', repository: 'https://github.com/bajankristof/nedb-promises', text: MIT },
    { name: 'Multer', version: '^2.0.1', license: 'MIT', description: '파일 업로드 미들웨어', repository: 'https://github.com/expressjs/multer', text: MIT },
    { name: 'morgan', version: '^1.10.0', license: 'MIT', description: 'HTTP 요청 로거', repository: 'https://github.com/expressjs/morgan', text: MIT },
    { name: 'cors', version: '^2.8.5', license: 'MIT', description: 'CORS 미들웨어', repository: 'https://github.com/expressjs/cors', text: MIT },
    { name: 'cookie-parser', version: '^1.4.7', license: 'MIT', description: '쿠키 파서 미들웨어', repository: 'https://github.com/expressjs/cookie-parser', text: MIT },
    { name: 'winston', version: '^3.17.0', license: 'MIT', description: '로깅 라이브러리', repository: 'https://github.com/winstonjs/winston', text: MIT },
    { name: 'winston-daily-rotate-file', version: '^5.0.0', license: 'MIT', description: '로그 파일 일일 로테이션', repository: 'https://github.com/winstonjs/winston-daily-rotate-file', text: MIT },
    { name: 'uuid', version: '^11.1.0', license: 'MIT', description: 'RFC UUID 생성', repository: 'https://github.com/uuidjs/uuid', text: MIT },
  ],
  player: [
    { name: 'GStreamer', version: '1.26', license: 'LGPL-2.1-or-later', description: '미디어 프레임워크 (core/base/video/audio/pbutils/app)', repository: 'https://gitlab.freedesktop.org/gstreamer/gstreamer', text: LGPL21 },
    { name: 'gstasio (vendored)', version: 'gst-plugins-bad 1.26.11', license: 'LGPL-2.1-or-later', description: 'ASIO 오디오 출력 플러그인 (클린룸 재구현)', repository: 'https://gitlab.freedesktop.org/gstreamer/gstreamer', text: LGPL21 },
    { name: 'nlohmann/json', version: '3.11.3', license: 'MIT', description: 'C++ JSON 라이브러리', repository: 'https://github.com/nlohmann/json', text: MIT },
    { name: 'lunasvg', version: '2.4.1', license: 'MIT', description: 'SVG 렌더링 (로고)', repository: 'https://github.com/sammycage/lunasvg', text: MIT },
    { name: 'stb (stb_image)', version: '—', license: 'MIT / Public Domain', description: '이미지 디코딩 (로고)', repository: 'https://github.com/nothings/stb', text: PD },
  ],
  notices: [
    {
      title: 'LGPL-2.1 준수 (GStreamer · gstasio)',
      body: 'GStreamer 및 vendored gstasio 플러그인은 LGPL-2.1-or-later로 동적 링크되어 사용됩니다. 해당 라이브러리의 소스와 라이선스 전문(COPYING.LIB)을 요청 시 제공하며, 사용자는 라이브러리를 교체·재링크할 수 있습니다.',
    },
    {
      title: 'Apache-2.0 NOTICE (Roboto, Material Icons)',
      body: 'Apache License 2.0 폰트/아이콘의 NOTICE 고지를 본 배포물에 포함합니다.',
    },
    {
      title: 'SIL OFL-1.1 (NanumGothic)',
      body: 'NanumGothic 폰트는 SIL Open Font License 1.1로 배포되며 © NAVER Corporation.',
    },
    {
      title: '상표 고지',
      body: 'ASIO는 Steinberg Media Technologies GmbH의 상표입니다.',
    },
  ],
}

export default licenses
