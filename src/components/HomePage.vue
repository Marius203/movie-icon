<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const goToMovies = () => {
  // Navigate to the movie list page (read-only)
  router.push('/movie-list')
}

const goToMyTaste = () => {
  // Navigate to the personal movie list page
  router.push('/my-taste')
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white relative p-4"
    style="
      background-image: url('https://images.unsplash.com/photo-1585252406583-b474fb5f5ade?q=80&w=2086&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
      background-size: cover;
      background-position: center;
    "
  >
    <!-- Overlay to ensure text readability over image -->
    <div class="absolute inset-0 bg-black opacity-50"></div>

    <!-- Content -->
    <div class="relative z-10 text-center">
      <h1 class="text-5xl font-extrabold mb-6 text-yellow-500 drop-shadow-lg">
        Of course your taste is better! 😎
      </h1>

      <div class="w-full max-w-md mb-8 mx-auto">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search for movies..."
          class="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-yellow-500 rounded-full text-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-opacity-30 transition duration-200"
        />
        <!-- Add a search button or trigger search on enter if needed -->
      </div>

      <button
        @click="goToMyTaste"
        class="bg-blue-700 text-white py-3 px-8 rounded-lg text-lg font-bold no-underline transition duration-200 ease-in-out border-none cursor-pointer text-center shadow-md hover:bg-blue-700 mb-4"
      >
        My Taste
      </button>
      <br />
      <button
        @click="goToMovies"
        class="bg-yellow-600 text-slate-900 py-3 px-8 rounded-lg text-lg font-bold no-underline transition duration-200 ease-in-out border-none cursor-pointer text-center shadow-md hover:bg-yellow-700"
      >
        Browse Movies
      </button>
    </div>
  </div>
</template>
