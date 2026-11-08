# 서드파티 소프트웨어 고지 (Third-Party Software Notices)

VP App UI의 소스 코드는 [GPL-3.0](LICENSE)으로 배포됩니다. 이 저장소가 포함하거나 사용하는
외부 구성 요소와 그 라이선스는 아래와 같습니다.

> 이 문서는 최선의 노력으로 작성된 것이며 법률 자문이 아닙니다.

## 1. 저장소에 포함된 외부 파일

| 파일 | 구성 요소 | 라이선스 | 원문 |
|---|---|---|---|
| `src/css/fonts/NanumGothic-*` | 나눔고딕 (© 2010 NAVER Corporation) | SIL Open Font License 1.1 | [licenses/OFL-1.1-NanumGothic.txt](licenses/OFL-1.1-NanumGothic.txt) |

폰트는 수정 없이 포함되며, OFL-1.1에 따라 폰트 자체를 단독으로 판매하지 않습니다.

## 2. npm 의존성

npm 패키지는 저장소에 포함되지 않고 `npm install` 시 내려받습니다. 빌드하면 아래 패키지가 결과물에 함께 묶입니다.

| 구성 요소 | 라이선스 |
|---|---|
| Vue, Vue Router, Pinia | MIT |
| Quasar, @quasar/extras | MIT |
| Roboto, Material Icons 폰트 (@quasar/extras 포함) | Apache-2.0 |
| axios, socket.io-client, vue-i18n, vuedraggable 등 나머지 의존성 | MIT, ISC, BSD-2/3-Clause, 0BSD, Apache-2.0 |

GPL·LGPL·AGPL·MPL 등 카피레프트 라이선스 npm 패키지는 없습니다. 모든 의존성 라이선스는
GPL-3.0과 함께 쓸 수 있습니다.

빌드 결과물에 포함되는 패키지의 라이선스 전문은 VP App 저장소의
[licenses/npm-webui.txt](https://github.com/jkjh8/vp_app2/blob/main/licenses/npm-webui.txt)에 있고,
앱의 **오픈소스 라이선스** 화면에서도 볼 수 있습니다.
