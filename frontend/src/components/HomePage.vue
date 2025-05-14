<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMoviesStore } from '@/stores/movies'
import { useUsersStore } from '@/stores/users'
import MovieDetailsPopup from './MovieDetailsPopup.vue'

const router = useRouter()
const moviesStore = useMoviesStore()
const userMoviesStore = useUsersStore()

// Search functionality
const searchQuery = ref('')
const showSuggestions = ref(false)
const selectedMovie = ref(null)
const isPopupOpen = ref(false)

// Filter movies based on search query
const filteredMovies = computed(() => {
  if (!searchQuery.value) return []

  const query = searchQuery.value.toLowerCase()
  return moviesStore.movies
    .filter(
      (movie) =>
        movie.title.toLowerCase().includes(query) || movie.director.toLowerCase().includes(query),
    )
    .slice(0, 5) // Limit to 5 suggestions
})

// Watch for search query changes
watch(searchQuery, (newValue) => {
  showSuggestions.value = newValue.length > 0
})

// Handle suggestion click
const handleSuggestionClick = (movie) => {
  selectedMovie.value = movie
  isPopupOpen.value = true
  showSuggestions.value = false
  searchQuery.value = ''
}

// Handle popup close
const handlePopupClose = () => {
  isPopupOpen.value = false
  selectedMovie.value = null
}

// Handle steal movie
const handleStealMovie = async (movie) => {
  // Check if the movie already exists in the user's list
  const exists = userMoviesStore.userMovies.some(
    (m) =>
      m.title === movie.title &&
      m.director === movie.director &&
      m.releaseDate === movie.releaseDate,
  )

  if (exists) {
    alert(`${movie.title} is already in your personal list.`)
    return
  }

  // Add a deep copy of the movie object to avoid reactivity issues
  const movieCopy = JSON.parse(JSON.stringify(movie))
  const success = await userMoviesStore.addMovie(movieCopy)
  
  if (success) {
    alert(`${movie.title} 'stolen' and added to your personal list!`)
  } else {
    alert(`Failed to add ${movie.title} to your personal list. Please try again.`)
  }
}

// Navigation functions
const goToMovies = () => {
  router.push('/movies')
}

const goToMyTaste = () => {
  router.push('/my-taste')
}

// Close suggestions when clicking outside
const handleClickOutside = (event) => {
  const searchContainer = document.getElementById('search-container')
  if (searchContainer && !searchContainer.contains(event.target)) {
    showSuggestions.value = false
  }
}

// Add and remove event listener for clicking outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    class="min-h-screen w-full h-screen flex flex-col items-center justify-center text-white relative p-4"
    style="
      background-image: url('https://images.unsplash.com/photo-1585252406583-b474fb5f5ade?q=80&w=2086&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    "
  >
    <!-- Overlay to ensure text readability over image -->
    <div class="absolute inset-0 bg-black opacity-50"></div>

    <!-- Content -->
    <div class="relative z-10 text-center">
      <h1 class="text-5xl font-extrabold mb-6 text-yellow-500 drop-shadow-lg">
        Of course your taste is better! 😎
      </h1>

      <!-- Search container with suggestions -->
      <div id="search-container" class="w-full max-w-md mb-8 mx-auto relative">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search for movies..."
            class="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-yellow-500 rounded-full text-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-opacity-30 transition duration-200"
          />
          <!-- Search icon -->
          <div class="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Suggestions dropdown -->
        <div
          v-if="showSuggestions && filteredMovies.length > 0"
          class="absolute w-full mt-1 bg-slate-800 border border-yellow-500 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          <div
            v-for="movie in filteredMovies"
            :key="movie.title + movie.director"
            @click="handleSuggestionClick(movie)"
            class="px-4 py-2 hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-slate-700 last:border-b-0"
          >
            <div class="text-left">
              <div class="text-yellow-500 font-medium">{{ movie.title }}</div>
              <div class="text-gray-400 text-sm">{{ movie.director }}</div>
            </div>
          </div>
        </div>
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

  <!-- Movie Details Popup -->
  <MovieDetailsPopup
    v-if="selectedMovie"
    :movie="selectedMovie"
    :is-open="isPopupOpen"
    @close="handlePopupClose"
    @steal="handleStealMovie"
  />
</template>
