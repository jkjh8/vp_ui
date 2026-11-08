// 단일 MainLayout 하위에 모든 페이지를 children으로 둔다.
// meta.transport: false = 하단 트랜스포트 바 숨김 (Home은 자체 대형 플레이어를 가짐).
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), meta: { transport: false } },
      { path: 'files', component: () => import('pages/FilesPage.vue') },
      { path: 'sources', component: () => import('pages/SourcesPage.vue') },
      { path: 'playlist', component: () => import('pages/PlaylistPage.vue') },
      { path: 'layouts', component: () => import('pages/LayoutsPage.vue') },
      { path: 'fleet', component: () => import('pages/FleetPage.vue') }, // 마스터 콘솔 (role=master 시 메뉴 노출)
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
      { path: 'help', component: () => import('pages/HelpPage.vue') },
      { path: 'licenses', component: () => import('pages/OpenSourcePage.vue') },
    ],
  },

  // Always leave this as last one,
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
