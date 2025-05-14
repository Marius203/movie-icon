<!-- javascript -->
<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useMoviesStore } from '@/stores/movies'
import { useUsersStore } from '@/stores/users'
import MovieDetailsPopup from './MovieDetailsPopup.vue'
import MovieClassificationChart from './MovieClassificationChart.vue'
import axios from 'axios'

const moviesStore = useMoviesStore()
const userMoviesStore = useUsersStore()

// Popup state
const selectedMovie = ref(null)
const isPopupOpen = ref(false)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Endless scrolling variables
const displayedMovies = ref([])
const offset = ref(0)
const limit = ref(20)
const loading = ref(false)
const noMoreMovies = ref(false)
const scrollActionPending = ref(false)

// WebSocket state
const ws = ref(null)
const isGenerating = ref(false)

// WebSocket functions
const connectWebSocket = () => {
  ws.value = new WebSocket('ws://localhost:3000')

  ws.value.onopen = () => {
    console.log('WebSocket connected')
    // Request current status
    ws.value.send(JSON.stringify({ type: 'GET_STATUS' }))
  }

  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data)

    switch (data.type) {
      case 'NEW_MOVIE':
        // Add the new movie to the displayed movies
        displayedMovies.value = [...displayedMovies.value, data.movie]
        break
      case 'GENERATION_STARTED':
        isGenerating.value = true
        break
      case 'GENERATION_STOPPED':
        isGenerating.value = false
        break
      case 'GENERATION_STATUS':
        isGenerating.value = data.isGenerating
        break
    }
  }

  ws.value.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  ws.value.onclose = () => {
    console.log('WebSocket disconnected')
    // Attempt to reconnect after 5 seconds
    setTimeout(connectWebSocket, 5000)
  }
}

// Function to toggle movie generation
const toggleMovieGeneration = () => {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    if (isGenerating.value) {
      ws.value.send(JSON.stringify({ type: 'STOP_GENERATION' }))
    } else {
      ws.value.send(JSON.stringify({ type: 'START_GENERATION' }))
    }
  }
}

// Function to check if a movie is in the user's list
const isMovieInUserList = (movie) => {
  return userMoviesStore.userMovies.some(
    (m) =>
      m.title === movie.title &&
      m.director === movie.director &&
      m.releaseDate === movie.releaseDate
  )
}

// Load initial movies and connect WebSocket
onMounted(async () => {
  loading.value = true
  
  // First, ensure user's movies are loaded
  if (userMoviesStore.isLoggedIn) {
    console.log('Fetching user movies on MovieList mount')
    await userMoviesStore.fetchUserMovies()
  }
  
  // Then fetch movies from the database
  await moviesStore.fetchMovies(limit.value, offset.value)
  displayedMovies.value = [...moviesStore.sortedMovies]
  loading.value = false

  // Add scroll event listener
  window.addEventListener('scroll', handleScroll)

  // Connect WebSocket
  connectWebSocket()
})

onUnmounted(() => {
  // Remove scroll event listener
  window.removeEventListener('scroll', handleScroll)

  // Close WebSocket connection
  if (ws.value) {
    ws.value.close()
  }
})

// Function to detect scroll position
const handleScroll = async () => {
  const bottomOfWindow =
    document.documentElement.scrollTop + window.innerHeight >=
    document.documentElement.offsetHeight - 200

  if (bottomOfWindow && !loading.value && !noMoreMovies.value && !scrollActionPending.value) {
    scrollActionPending.value = true
    await delay(500)

    if (!loading.value && !noMoreMovies.value) {
      loadMoreMovies()
    }

    scrollActionPending.value = false
  }
}

const loadMoreMovies = async () => {
  if (loading.value || noMoreMovies.value) return

  loading.value = true
  offset.value += limit.value

  await moviesStore.fetchMovies(limit.value, offset.value)

  // If no more movies were returned, mark as finished
  if (moviesStore.sortedMovies.length === 0) {
    noMoreMovies.value = true
    loading.value = false
    return
  }

  // Add the new movies
  displayedMovies.value = [...displayedMovies.value, ...moviesStore.sortedMovies]

  loading.value = false
}

// Handle sorting with endless scrolling
const resetMovieList = async () => {
  offset.value = 0
  noMoreMovies.value = false
  loading.value = true

  await moviesStore.fetchMovies(limit.value, offset.value)
  displayedMovies.value = [...moviesStore.sortedMovies]

  loading.value = false
}

const sortByTitle = async () => {
  if (moviesStore.sortOption === 'titleAsc') {
    moviesStore.setSortOption('titleDesc')
    await moviesStore.fetchMoviesWithSort('title', 'desc')
  } else {
    moviesStore.setSortOption('titleAsc')
    await moviesStore.fetchMoviesWithSort('title', 'asc')
  }

  await resetMovieList()
}

const sortByRating = async () => {
  if (moviesStore.sortOption === 'ratingAsc') {
    moviesStore.setSortOption('ratingDesc')
    await moviesStore.fetchMoviesWithSort('rating', 'desc')
  } else {
    moviesStore.setSortOption('ratingAsc')
    await moviesStore.fetchMoviesWithSort('rating', 'asc')
  }

  await resetMovieList()
}

const resetSort = async () => {
  moviesStore.setSortOption('default')
  await resetMovieList()
}

// Handle movie click
const handleMovieClick = (movie) => {
  selectedMovie.value = movie
  isPopupOpen.value = true
}

// Handle popup close
const handlePopupClose = () => {
  isPopupOpen.value = false
  selectedMovie.value = null
}

// Handle steal movie
const handleStealMovie = async (movie) => {
  // Check if the movie already exists in the user's list
  if (isMovieInUserList(movie)) {
    alert(`${movie.title} is already in your personal list.`)
    return
  }

  // Add a deep copy of the movie object to avoid reactivity issues
  const movieCopy = JSON.parse(JSON.stringify(movie))
  const success = await userMoviesStore.addMovie(movieCopy)
  
  if (success) {
    alert(`${movie.title} 'stolen' and added to your personal list!`)
    handlePopupClose()
  } else {
    alert(`Failed to add ${movie.title} to your personal list. Please try again.`)
  }
}
</script>

<!-- html -->
<template>
  <!-- Title -->
  <h1
    class="font-sans font-bold text-center text-yellow-600 mb-8 text-4xl pb-2.5 border-b-2 border-yellow-600 tracking-wide max-w-3xl mx-auto"
  >
    Browse All Movies
  </h1>

  <!-- Movie Classification Chart -->
  <MovieClassificationChart
    :movies="displayedMovies"
    :get-movie-classification="moviesStore.getMovieClassification"
  />

  <!-- Main content wrapper -->
  <div class="max-w-3xl mx-auto">
    <!-- Sorting controls -->
    <div class="max-w-3xl mx-auto mb-5 text-center">
      <button
        @click="sortByTitle()"
        class="bg-yellow-600 text-slate-900 py-2 px-4 rounded font-semibold text-sm hover:bg-yellow-700 transition duration-200 ease-in-out mx-1"
        :class="{
          'bg-yellow-700 ring-2 ring-yellow-400':
            moviesStore.sortOption === 'titleAsc' || moviesStore.sortOption === 'titleDesc',
        }"
      >
        Sort by Title
        <span v-if="moviesStore.sortOption === 'titleAsc'" class="ml-1">▲</span>
        <span v-else-if="moviesStore.sortOption === 'titleDesc'" class="ml-1">▼</span>
      </button>

      <button
        @click="sortByRating()"
        class="bg-yellow-600 text-slate-900 py-2 px-4 rounded font-semibold text-sm hover:bg-yellow-700 transition duration-200 ease-in-out mx-1"
        :class="{
          'bg-yellow-700 ring-2 ring-yellow-400':
            moviesStore.sortOption === 'ratingAsc' || moviesStore.sortOption === 'ratingDesc',
        }"
      >
        Sort by Rating
        <span v-if="moviesStore.sortOption === 'ratingAsc'" class="ml-1">▲</span>
        <span v-else-if="moviesStore.sortOption === 'ratingDesc'" class="ml-1">▼</span>
      </button>

      <button
        @click="resetSort()"
        class="bg-gray-600 text-white py-2 px-4 rounded font-semibold text-sm hover:bg-gray-700 transition duration-200 ease-in-out mx-1"
      >
        Reset Sort
      </button>
    </div>

    <!-- Movie Count -->
    <div class="max-w-3xl mx-auto text-center text-gray-400 mb-4">
      Showing {{ displayedMovies.length }} movies
    </div>

    <!-- Movie list -->
    <ul class="list-none p-0 max-w-3xl mx-auto">
      <li
        v-for="(movie, index) in displayedMovies"
        :key="`${movie.id}-${index}`"
        class="border-2 border-yellow-600 rounded-lg p-4 mb-5 shadow-md bg-slate-800 w-11/12 mx-auto cursor-pointer hover:border-yellow-500 transition-colors"
        @click="handleMovieClick(movie)"
      >
        <div class="flex justify-between items-center mb-2 border-b border-yellow-600 pb-2">
          <h2
            class="font-sans font-extrabold m-0 text-yellow-600 tracking-tight flex items-center gap-2.5 text-2xl"
          >
            {{ movie.title }}
            <span class="text-xl ml-1.5">{{
              moviesStore.getMovieClassification(movie.releaseDate)
            }}</span>
          </h2>

          <button
            @click.stop="handleStealMovie(movie)"
            :disabled="isMovieInUserList(movie)"
            class="px-2 py-1 text-sm rounded transition-colors"
            :class="
              isMovieInUserList(movie)
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            "
          >
            {{ isMovieInUserList(movie) ? 'Already Stolen' : 'Steal this' }}
          </button>
        </div>

        <div class="pt-2 flex items-start">
          <img
            :src="movie.poster"
            :alt="movie.title"
            class="max-w-[120px] h-auto mr-4 rounded shadow-md border border-yellow-600"
          />
          <div class="flex flex-col justify-around flex-1">
            <p class="my-1.5 text-gray-200">
              <strong class="text-yellow-600">Rating: </strong>
              <span>{{ movie.rating }}/10</span>
            </p>
            <p class="my-1.5 text-gray-200">
              <strong class="text-yellow-600">Director:</strong> {{ movie.director }}
            </p>
            <p class="my-1.5 text-gray-200">
              <strong class="text-yellow-600">Release Year:</strong>
              {{ new Date(movie.releaseDate).getFullYear() }}
            </p>
            <p class="mt-2.5 italic leading-snug text-gray-400">
              {{ movie.description }}
            </p>
          </div>
        </div>
      </li>
    </ul>

    <!-- Scroll action pending indicator -->
    <div v-if="scrollActionPending && !loading" class="text-center py-4">
      <div
        class="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-amber-500 border-r-transparent"
      ></div>
      <p class="mt-2 text-amber-500">Preparing to load more...</p>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center py-4">
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-600 border-r-transparent"
      ></div>
      <p class="mt-2 text-yellow-600">Loading more movies...</p>
    </div>

    <!-- End of list message -->
    <div v-if="noMoreMovies && displayedMovies.length > 0" class="text-center py-4 text-gray-400">
      End of movie list
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

<!-- css -->
<style scoped>
/* Styles removed as they are replaced by Tailwind classes */
</style>
