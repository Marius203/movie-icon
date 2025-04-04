<!-- javascript -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
// import { useMoviesStore } from '@/stores/movies' // We might change this later for user-specific data
import { useUsersStore } from '@/stores/users' // Import the new user store
import MovieClassificationChart from './MovieClassificationChart.vue'

// const moviesStore = useMoviesStore()
const userMoviesStore = useUsersStore() // Use the user store instance

// Worker setup (Keep or remove based on whether user list needs generation)
let movieWorker = null
let generationInterval = null
const isGenerating = ref(false)

// Initialize worker (if kept)
onMounted(() => {
  movieWorker = new Worker(new URL('../workers/movieGenerator.js', import.meta.url), {
    type: 'module',
  })

  movieWorker.onmessage = (event) => {
    if (event.data.type === 'MOVIES_GENERATED') {
      // Add generated movies specifically to the user's list in the future
      event.data.movies.forEach((movie) => {
        // moviesStore.addMovie(movie) // Modify this later
        userMoviesStore.addMovie(movie) // Add to user store
      })
    }
  }
})

// Toggle generation (if kept)
const toggleGeneration = () => {
  if (isGenerating.value) {
    if (generationInterval) {
      clearInterval(generationInterval)
      generationInterval = null
    }
    isGenerating.value = false
  } else {
    generationInterval = setInterval(() => {
      movieWorker.postMessage({ type: 'GENERATE_MOVIES', count: 1 })
    }, 50)
    isGenerating.value = true
  }
}

// Cleanup worker (if kept)
onUnmounted(() => {
  if (movieWorker) {
    movieWorker.terminate()
  }
  if (generationInterval) {
    clearInterval(generationInterval)
  }
})

// Pagination
const currentPage = ref(1)

// Use the sortedMovies computed property (will need modification for user data)
// const movies = computed(() => moviesStore.sortedMovies)
const movies = computed(() => userMoviesStore.sortedMovies) // Get movies from user store

// Calculate paginated movies
const paginatedMovies = computed(() => {
  const startIndex = (currentPage.value - 1) * userMoviesStore.moviesPerPage
  const endIndex = startIndex + userMoviesStore.moviesPerPage
  return movies.value.slice(startIndex, endIndex)
})

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(movies.value.length / userMoviesStore.moviesPerPage)
})

// Handle movies per page change
const handleMoviesPerPageChange = (value) => {
  // moviesStore.setMoviesPerPage(parseInt(value))
  userMoviesStore.setMoviesPerPage(parseInt(value)) // Use user store action
  currentPage.value = 1
}

// Navigate to a specific page
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Previous page
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Next page
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Editing Ratings (Keep this functionality)
const editingRating = ref(null)
const newRating = ref(0)

const startEditRating = (index, currentRating) => {
  editingRating.value = index
  newRating.value = currentRating
}

const updateRating = (index) => {
  if (newRating.value >= 0 && newRating.value <= 10) {
    const actualIndex = (currentPage.value - 1) * userMoviesStore.moviesPerPage + index
    // moviesStore.updateMovieRating(actualIndex, parseFloat(newRating.value)) // Modify later for user data
    userMoviesStore.updateMovieRating(actualIndex, parseFloat(newRating.value)) // Use user store action
    editingRating.value = null
  } else {
    alert('Rating must be between 0 and 10')
  }
}

// Remove Movie (Keep this functionality)
const removeMovie = (index) => {
  if (confirm('Are you sure you want to remove this movie from your list?')) {
    const actualIndex = (currentPage.value - 1) * userMoviesStore.moviesPerPage + index
    // moviesStore.removeMovie(actualIndex) // Modify later for user data
    userMoviesStore.removeMovie(actualIndex) // Use user store action
    if (currentPage.value > 1 && paginatedMovies.value.length === 0) {
      currentPage.value--
    }
  }
}

// Sorting functions (Keep)
const sortByTitle = () => {
  if (userMoviesStore.sortOption === 'titleAsc') {
    userMoviesStore.setSortOption('titleDesc')
  } else {
    userMoviesStore.setSortOption('titleAsc')
  }
  currentPage.value = 1
}

const sortByRating = () => {
  if (userMoviesStore.sortOption === 'ratingAsc') {
    userMoviesStore.setSortOption('ratingDesc')
  } else {
    userMoviesStore.setSortOption('ratingAsc')
  }
  currentPage.value = 1
}

const resetSort = () => {
  userMoviesStore.setSortOption('default')
  currentPage.value = 1
}

// Pagination buttons (Keep)
const paginationButtons = computed(() => {
  const buttons = []
  const maxVisiblePages = 5
  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) buttons.push(i)
  } else {
    buttons.push(1)
    let start = Math.max(2, currentPage.value - 1)
    let end = Math.min(totalPages.value - 1, currentPage.value + 1)
    if (currentPage.value <= 3) {
      start = 2
      end = 4
    } else if (currentPage.value >= totalPages.value - 2) {
      start = totalPages.value - 3
      end = totalPages.value - 1
    }
    if (start > 2) buttons.push('...')
    for (let i = start; i <= end; i++) buttons.push(i)
    if (end < totalPages.value - 1) buttons.push('...')
    buttons.push(totalPages.value)
  }
  return buttons
})
</script>

<!-- html -->
<template>
  <!-- Add a title specific to this page -->
  <h1
    class="font-sans font-bold text-center text-yellow-600 mb-8 text-4xl pb-2.5 border-b-2 border-yellow-600 tracking-wide max-w-3xl mx-auto"
  >
    My Taste - Personal Movie List
  </h1>

  <!-- Movie Classification Chart (Optional for this page) -->
  <!-- Consider if this chart should use userMoviesStore.userMovies -->
  <MovieClassificationChart
    :movies="userMoviesStore.userMovies"
    :getMovieClassification="userMoviesStore.getMovieClassification"
  />

  <!-- Main content wrapper -->
  <div class="max-w-3xl mx-auto">
    <!-- Worker Toggle Button (if kept) -->
    <button
      v-if="isGenerating !== null"
      @click="toggleGeneration"
      class="fixed bottom-5 right-5 z-50 px-4 py-2 rounded-md shadow-md text-white font-medium transition duration-150 ease-in-out"
      :class="isGenerating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
    >
      {{ isGenerating ? 'Stop Generating Movies' : 'Start Generating Movies' }}
    </button>

    <!-- Sorting controls (Keep) -->
    <div class="max-w-3xl mx-auto mb-5 text-center">
      <button
        @click="sortByTitle()"
        class="bg-yellow-600 text-slate-900 py-2 px-4 rounded font-semibold text-sm hover:bg-yellow-700 transition duration-200 ease-in-out mx-1"
        :class="{
          'bg-yellow-700 ring-2 ring-yellow-400':
            userMoviesStore.sortOption === 'titleAsc' || userMoviesStore.sortOption === 'titleDesc',
        }"
      >
        Sort by Title
        <span v-if="userMoviesStore.sortOption === 'titleAsc'" class="ml-1">▲</span>
        <span v-else-if="userMoviesStore.sortOption === 'titleDesc'" class="ml-1">▼</span>
      </button>
      <button
        @click="sortByRating()"
        class="bg-yellow-600 text-slate-900 py-2 px-4 rounded font-semibold text-sm hover:bg-yellow-700 transition duration-200 ease-in-out mx-1"
        :class="{
          'bg-yellow-700 ring-2 ring-yellow-400':
            userMoviesStore.sortOption === 'ratingAsc' ||
            userMoviesStore.sortOption === 'ratingDesc',
        }"
      >
        Sort by Rating
        <span v-if="userMoviesStore.sortOption === 'ratingAsc'" class="ml-1">▲</span>
        <span v-else-if="userMoviesStore.sortOption === 'ratingDesc'" class="ml-1">▼</span>
      </button>
      <button
        @click="resetSort()"
        class="bg-gray-600 text-white py-2 px-4 rounded font-semibold text-sm hover:bg-gray-700 transition duration-200 ease-in-out mx-1"
      >
        Reset Sort
      </button>
    </div>

    <!-- Movie Count (Keep) -->
    <div class="max-w-3xl mx-auto text-center text-gray-400 mb-4">
      Total Movies: {{ movies.length }}
    </div>

    <!-- Movies per page selector (Keep) -->
    <div class="max-w-3xl mx-auto flex items-center justify-center gap-2.5 mb-5">
      <label for="moviesPerPage" class="text-gray-300 font-semibold">Movies per page:</label>
      <select
        id="moviesPerPage"
        :value="userMoviesStore.moviesPerPage"
        @change="handleMoviesPerPageChange($event.target.value)"
        class="bg-slate-700 border border-yellow-600 text-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option :value="movies.length">All</option>
      </select>
    </div>

    <!-- Movie List (Use user store data, change structure to ul/li) -->
    <ul v-if="movies.length > 0" class="list-none p-0 max-w-3xl mx-auto">
      <li
        v-for="(movie, index) in paginatedMovies"
        :key="movie.title + movie.director + index"
        class="border-2 border-yellow-600 rounded-lg p-4 mb-5 shadow-md bg-slate-800 w-11/12 mx-auto"
      >
        <!-- Movie Title and Header Section -->
        <div class="flex justify-between items-center mb-2 border-b border-yellow-600 pb-2">
          <h2 class="font-sans font-extrabold m-0 text-yellow-600 tracking-tight text-2xl">
            {{ movie.title }}
          </h2>
          <!-- Keep Edit Rating button positioning or adjust as needed -->
          <button
            v-if="editingRating !== index"
            @click="startEditRating(index, movie.rating)"
            class="text-yellow-500 hover:text-yellow-400 text-sm ml-4 flex-shrink-0"
          >
            Edit Rating
          </button>
        </div>

        <!-- Movie Content with Poster -->
        <div class="pt-2 flex items-start">
          <img
            :src="movie.poster"
            :alt="movie.title"
            class="max-w-[120px] h-auto mr-4 rounded shadow-md border border-yellow-600"
          />
          <div class="flex flex-col justify-around flex-1">
            <!-- Movie Details -->
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

            <!-- Rating Display / Edit Form -->
            <div v-if="editingRating === index" class="flex items-center gap-2 mt-3">
              <input
                type="number"
                v-model="newRating"
                min="0"
                max="10"
                step="0.1"
                class="bg-gray-700 text-white rounded p-1 w-20 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                @click="updateRating(index)"
                class="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-green-700 transition duration-150"
              >
                Save
              </button>
              <button
                @click="editingRating = null"
                class="bg-gray-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-gray-700 transition duration-150"
              >
                Cancel
              </button>
            </div>
            <div v-else class="flex items-center mt-3">
              <span class="text-yellow-400 font-bold text-lg">★ {{ movie.rating }} / 10</span>
            </div>

            <!-- Remove Button -->
            <button
              @click="removeMovie(index)"
              class="mt-4 bg-red-600 text-white py-2 px-4 rounded font-semibold text-sm hover:bg-red-700 transition duration-200 ease-in-out w-full"
            >
              Remove from My List
            </button>
          </div>
        </div>
      </li>
    </ul>
    <div v-else class="text-center text-gray-400 py-10">
      Your personal movie list is empty. Start adding movies!
    </div>

    <!-- Pagination (Keep, update styles) -->
    <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-8 mb-8">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
      >
        &laquo; Prev
      </button>
      <template v-for="(button, index) in paginationButtons" :key="index">
        <button
          v-if="typeof button === 'number'"
          @click="goToPage(button)"
          :class="[
            'px-4 py-2 rounded transition duration-150',
            button === currentPage
              ? 'bg-yellow-600 text-slate-900 font-bold' // Active state like MovieList
              : 'bg-slate-700 text-white hover:bg-slate-600', // Inactive state like MovieList
          ]"
        >
          {{ button }}
        </button>
        <span v-else class="text-gray-400 px-2">{{ button }}</span>
      </template>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
      >
        Next &raquo;
      </button>
    </div>
  </div>
</template>
