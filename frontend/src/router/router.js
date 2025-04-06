import { createRouter, createWebHistory } from 'vue-router'
import MovieList from '@/components/MovieList.vue'
import AddMovie from '@/components/AddMovie.vue'
import LoginPage from '@/components/LoginPage.vue'
import HomePage from '@/components/HomePage.vue'
import MyTastePage from '@/components/MyTastePage.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'
import { useAdminStore } from '@/stores/admin'

// Helper function to check login status
const isAuthenticated = () => {
  return localStorage.getItem('userLoggedIn') === 'true'
}

// Helper function to check admin status
const isAdmin = () => {
  return localStorage.getItem('adminLoggedIn') === 'true'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/home',
      name: 'home',
      component: HomePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/movies',
      name: 'movies',
      component: MovieList,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-taste',
      name: 'my-taste',
      component: MyTastePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: AdminDashboard,
      meta: { requiresAdmin: true },
    },
  ],
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  // Allow access to login page
  if (to.path === '/login') {
    next()
    return
  }

  // Check authentication for protected routes
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else if (to.meta.requiresAdmin && !isAdmin()) {
    next('/login')
  } else {
    next()
  }
})

export default router
