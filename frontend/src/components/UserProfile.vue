<script setup>
import { ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useRouter } from 'vue-router'

const usersStore = useUsersStore()
const router = useRouter()
const userProfile = ref(null)
const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    isLoading.value = true
    const profile = await usersStore.getUserProfile()
    userProfile.value = profile
  } catch (err) {
    console.error('Error fetching user profile:', err)
    error.value = 'Failed to load user profile'
  } finally {
    isLoading.value = false
  }
})

const handleLogout = () => {
  usersStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="bg-slate-800 shadow-lg rounded-lg overflow-hidden border-2 border-blue-600">
        <div class="px-6 py-8">
          <h1 class="text-3xl font-bold text-blue-600 mb-6">User Profile</h1>
          
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
          
          <div v-else-if="error" class="text-red-500 text-center py-4">
            {{ error }}
          </div>
          
          <div v-else-if="userProfile" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 class="text-xl font-semibold text-gray-300 mb-2">Username</h2>
                <p class="text-white">{{ userProfile.username }}</p>
              </div>
              
              <div>
                <h2 class="text-xl font-semibold text-gray-300 mb-2">Email</h2>
                <p class="text-white">{{ userProfile.email }}</p>
              </div>
              
              <div>
                <h2 class="text-xl font-semibold text-gray-300 mb-2">Member Since</h2>
                <p class="text-white">{{ new Date(userProfile.createdAt).toLocaleDateString() }}</p>
              </div>
              
              <div>
                <h2 class="text-xl font-semibold text-gray-300 mb-2">Account Type</h2>
                <p class="text-white">{{ userProfile.isAdmin ? 'Administrator' : 'Regular User' }}</p>
              </div>
            </div>
            
            <div class="pt-6 border-t border-gray-700">
              <h2 class="text-xl font-semibold text-gray-300 mb-4">Your Movie Preferences</h2>
              
              <div v-if="userProfile.movies && userProfile.movies.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="movie in userProfile.movies" :key="movie.id" class="bg-slate-700 p-4 rounded-lg">
                  <h3 class="font-medium text-white">{{ movie.title }}</h3>
                  <p class="text-gray-400 text-sm">{{ movie.year }}</p>
                  <div class="mt-2 flex items-center">
                    <span class="text-yellow-500">★</span>
                    <span class="ml-1 text-white">{{ movie.rating || 'Not rated' }}</span>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-gray-400 text-center py-4">
                You haven't added any movies to your preferences yet.
              </div>
            </div>
          </div>
          
          <div class="mt-8 flex justify-between">
            <button
              @click="router.push('/home')"
              class="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back to Home
            </button>
            
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 