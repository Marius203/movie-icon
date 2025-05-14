<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const usersStore = useUsersStore()
const adminStore = useAdminStore()

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    // First check if it's an admin login
    const adminResult = await adminStore.login(username.value, password.value)

    if (adminResult.success) {
      // If admin login successful, redirect to admin dashboard
      router.push('/admin/dashboard')
      return
    }

    // If not admin, try regular user login
    const loginSuccess = await usersStore.login(username.value, password.value)

    if (loginSuccess) {
      router.push('/home')
    } else {
      error.value = 'Invalid credentials'
    }
  } catch (err) {
    error.value = 'Login failed. Please try again.'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900">
    <div class="max-w-md w-full p-8 bg-slate-800 rounded-lg shadow-lg border-2 border-blue-600">
      <h1 class="text-3xl font-bold text-center text-blue-600 mb-8">Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 bg-slate-700 border border-blue-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 bg-slate-700 border border-blue-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <button
          @click="router.push('/register')"
          class="text-blue-600 hover:underline"
        >
          Register
        </button>
      </div>
    </div>
  </div>
</template>
