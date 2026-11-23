import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/player' },
  {
    path: '/player',
    name: 'player',
    component: () => import('@/views/player/PlayerView.vue'),
    meta: { title: '音乐播放' },
  },
  {
    path: '/playlists',
    name: 'playlists',
    component: () => import('@/views/playlist/PlaylistsView.vue'),
    meta: { title: '歌单列表' },
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('@/views/library/LibraryView.vue'),
    meta: { title: '本地音乐' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/player' },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.afterEach((to) => {
  const title = to.meta?.title ?? '音乐播放'
  document.title = `${title} · Music Player`
})
