<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const usersStore = useUsersStore()
const adminStore = useAdminStore()

// Check if any user is logged in (either regular user or admin)
const isLoggedIn = computed(() => {
  return usersStore.isLoggedIn || adminStore.isAdmin
})

// Check if user is admin
// Only admins should see the Admin Dashboard link
const isAdmin = computed(() => {
  return adminStore.isAdmin
})

// Navigation functions
const goToHome = () => {
  router.push('/home')
}

const goToMovies = () => {
  router.push('/movies')
}

const goToMyTaste = () => {
  router.push('/my-taste')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToAdminDashboard = () => {
  router.push('/admin/dashboard')
}
</script>

<template>
  <nav v-if="isLoggedIn" class="bg-slate-800 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="text-yellow-500 font-bold text-xl">MovieIcon</span>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <button
                @click="goToHome"
                class="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </button>
              <button
                @click="goToMovies"
                class="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Movies
              </button>
              <button
                @click="goToMyTaste"
                class="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                My Taste
              </button>
              <button
                @click="goToProfile"
                class="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </button>
              <button
                v-if="isAdmin"
                @click="goToAdminDashboard"
                class="text-yellow-500 hover:bg-slate-700 hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template> 