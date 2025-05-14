<script setup>
import { ref, computed } from 'vue'
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

// Handle logout
const handleLogout = () => {
  if (usersStore.isLoggedIn) {
    usersStore.logout()
  }
  
  if (adminStore.isAdmin) {
    adminStore.logout()
  }
  
  // Redirect to login page
  router.push('/login')
}
</script>

<template>
  <div v-if="isLoggedIn" class="fixed bottom-4 right-4 z-50">
    <button
      @click="handleLogout"
      class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span>Logout</span>
    </button>
  </div>
</template> 