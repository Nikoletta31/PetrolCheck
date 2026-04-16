import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingPage,
    meta: { title: 'PetrolCheck - Comparez les prix du carburant' }
  },
  {
    path: '/app',
    name: 'app',
    component: () => import('@/views/AppView.vue'),
    meta: { title: 'Carburant Map' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  document.title = to.meta.title || 'PetrolCheck'
})

export default router
