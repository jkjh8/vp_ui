# VP App UI

[VP App](https://github.com/jkjh8/vp_app2)의 운영자 웹 UI입니다. Vue 3와 Quasar로 만든 SPA로,
VP App 서버가 정적 파일로 서빙합니다.

브라우저에서 플레이리스트, 파일, 화면 구성, 오디오 라우팅, 라이브 소스, 멀티 PC 동기,
소프트웨어 업데이트를 관리합니다. 기능별 사용법은
[운영자 사용 설명서](https://github.com/jkjh8/vp_app2/blob/main/docs/USER_GUIDE.md)를 참고하세요.

## 개발

필요 환경: Node.js 22

```bash
npm install
npm run dev        # 개발 서버 (핫 리로드)
npm run lint
```

## 빌드

```bash
npm run build      # dist/spa 에 빌드
npm run build:app  # 빌드 후 ../vp_app2/public/spa 로 복사
```

`build:app`은 이 저장소와 [vp_app2](https://github.com/jkjh8/vp_app2)가 같은 폴더 아래에 있다고 가정합니다.

## 라이선스

이 저장소의 소스 코드는 [GNU General Public License v3.0](LICENSE)으로 배포됩니다.
수정하거나 재배포할 때는 같은 GPL-3.0 조건으로 소스 코드를 함께 공개해야 합니다.
사용한 npm 패키지는 각자의 라이선스를 따르며, 나눔고딕 등 포함된 폰트는
SIL Open Font License 1.1을 따릅니다. 전체 목록은 앱의 오픈소스 라이선스 화면에서 볼 수 있습니다.
