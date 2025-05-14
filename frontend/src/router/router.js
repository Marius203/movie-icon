import { createRouter, createWebHistory } from 'vue-router'
import MovieList from '@/components/MovieList.vue'
import LoginPage from '@/components/LoginPage.vue'
import RegisterPage from '@/components/RegisterPage.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'
import UserProfile from '@/components/UserProfile.vue'
import { useUsersStore } from '@/stores/users'
import { useAdminStore } from '@/stores/admin'
import HomePage from '@/components/HomePage.vue'
import MyTastePage from '@/components/MyTastePage.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
    component: LoginPage,
    meta: { guest: true }
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { guest: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAdmin: true }
  },
  {
    path: '/movies',
    name: 'movies',
    component: MovieList,
    meta: { requiresAuth: true }
  },{
    path: '/my-taste',
    name: 'my-taste',
    component: MyTastePage,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const usersStore = useUsersStore()
  const adminStore = useAdminStore()
  
  // Check if user is logged in (either as regular user or admin)
  const isLoggedIn = usersStore.isLoggedIn || adminStore.isAdmin
  const isAdmin = adminStore.isAdmin
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      // Redirect to login if not authenticated
      next({ name: 'login' })
    } else {
      next()
    }
  } 
  // Check if route requires admin access
  else if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!isAdmin) {
      // Redirect to home if not admin
      next({ name: 'home' })
    } else {
      next()
    }
  }
  // Check if route is for guests only (login, register)
  else if (to.matched.some(record => record.meta.guest)) {
    if (isLoggedIn) {
      // Redirect to home if already logged in
      next({ name: 'home' })
    } else {
      next()
    }
  }
  else {
    next()
  }
})

export default router
