import { createRouter, createWebHistory } from 'vue-router'
import MovieList from '@/components/MovieList.vue'
import AddMovie from '@/components/AddMovie.vue'
import LoginPage from '@/components/LoginPage.vue'
import HomePage from '@/components/HomePage.vue'
import MyTastePage from '@/components/MyTastePage.vue'

// Helper function to check login status (using localStorage for simplicity)
const isAuthenticated = () => {
  return localStorage.getItem('userLoggedIn') === 'true'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginPage,
      meta: { requiresGuest: true },
    },
    {
      path: '/home',
      name: 'home',
      component: HomePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-taste',
      name: 'my-taste',
      component: MyTastePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/movie-list',
      name: 'movie-list',
      component: MovieList,
      meta: { requiresAuth: true },
    },
    {
      path: '/add-movie',
      name: 'add-movie',
      component: AddMovie,
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  if (requiresAuth && !isAuthenticated()) {
    next({ name: 'login' })
  } else if (requiresGuest && isAuthenticated()) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
