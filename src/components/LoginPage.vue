<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')

const login = () => {
  error.value = ''
  // Basic validation (replace with real auth later)
  if (email.value && password.value) {
    // Simulate successful login
    localStorage.setItem('userLoggedIn', 'true')
    router.push('/home') // Redirect to the new home page
  } else {
    error.value = 'Please enter both email and password.'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900">
    <div class="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-yellow-600">
      <h2 class="text-2xl font-bold mb-6 text-center text-yellow-600">Login</h2>
      <form @submit.prevent="login">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="your.email@example.com"
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-300 mb-1"
            >Password</label
          >
          <input
            type="password"
            id="password"
            v-model="password"
            required
            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="********"
          />
        </div>
        <p v-if="error" class="text-red-500 text-sm mb-4 text-center">{{ error }}</p>
        <button
          type="submit"
          class="w-full bg-yellow-600 text-slate-900 py-2 px-4 rounded-md font-semibold hover:bg-yellow-700 transition duration-200"
        >
          Login
        </button>
      </form>
    </div>
  </div>
</template>
