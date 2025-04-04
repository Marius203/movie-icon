<!-- javascript -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMoviesStore } from '@/stores/movies' // We might change this later for user-specific data
import MovieClassificationChart from './MovieClassificationChart.vue'

const moviesStore = useMoviesStore()

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
        moviesStore.addMovie(movie) // Modify this later
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
const movies = computed(() => moviesStore.sortedMovies)

// Calculate paginated movies
const paginatedMovies = computed(() => {
  const startIndex = (currentPage.value - 1) * moviesStore.moviesPerPage
  const endIndex = startIndex + moviesStore.moviesPerPage
  return movies.value.slice(startIndex, endIndex)
})

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(movies.value.length / moviesStore.moviesPerPage)
})

// Handle movies per page change
const handleMoviesPerPageChange = (value) => {
  moviesStore.setMoviesPerPage(parseInt(value))
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
    const actualIndex = (currentPage.value - 1) * moviesStore.moviesPerPage + index
    moviesStore.updateMovieRating(actualIndex, parseFloat(newRating.value)) // Modify later for user data
    editingRating.value = null
  } else {
    alert('Rating must be between 0 and 10')
  }
}

// Remove Movie (Keep this functionality)
const removeMovie = (index) => {
  if (confirm('Are you sure you want to remove this movie from your list?')) {
    const actualIndex = (currentPage.value - 1) * moviesStore.moviesPerPage + index
    moviesStore.removeMovie(actualIndex) // Modify later for user data
    if (currentPage.value > 1 && paginatedMovies.value.length === 0) {
      currentPage.value--
    }
  }
}

// Sorting functions (Keep)
const sortByTitle = () => {
  if (moviesStore.sortOption === 'titleAsc') {
    moviesStore.setSortOption('titleDesc')
  } else {
    moviesStore.setSortOption('titleAsc')
  }
  currentPage.value = 1
}

const sortByRating = () => {
  if (moviesStore.sortOption === 'ratingAsc') {
    moviesStore.setSortOption('ratingDesc')
  } else {
    moviesStore.setSortOption('ratingAsc')
  }
  currentPage.value = 1
}

const resetSort = () => {
  moviesStore.setSortOption('default')
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
    class="font-sans font-bold text-center text-blue-500 mb-8 text-4xl pb-2.5 border-b-2 border-blue-500 tracking-wide max-w-3xl mx-auto"
  >
    My Taste - Personal Movie List
  </h1>

  <!-- Movie Classification Chart (Optional for this page) -->
  <MovieClassificationChart />

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
        class="bg-blue-600 text-white py-2 px-4 rounded font-semibold text-sm hover:bg-blue-700 transition duration-200 ease-in-out mx-1"
        :class="{
          'bg-blue-700 ring-2 ring-blue-400':
            moviesStore.sortOption === 'titleAsc' || moviesStore.sortOption === 'titleDesc',
        }"
      >
        Sort by Title
        <span v-if="moviesStore.sortOption === 'titleAsc'">▲</span>
        <span v-else-if="moviesStore.sortOption === 'titleDesc'">▼</span>
      </button>
      <button
        @click="sortByRating()"
        class="bg-blue-600 text-white py-2 px-4 rounded font-semibold text-sm hover:bg-blue-700 transition duration-200 ease-in-out mx-1"
        :class="{
          'bg-blue-700 ring-2 ring-blue-400':
            moviesStore.sortOption === 'ratingAsc' || moviesStore.sortOption === 'ratingDesc',
        }"
      >
        Sort by Rating
        <span v-if="moviesStore.sortOption === 'ratingAsc'">▲</span>
        <span v-else-if="moviesStore.sortOption === 'ratingDesc'">▼</span>
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
        :value="moviesStore.moviesPerPage"
        @change="handleMoviesPerPageChange($event.target.value)"
        class="bg-slate-700 border border-blue-500 text-blue-500 rounded py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
      </select>
    </div>

    <!-- Movie list (Keep editing/deleting functionality) -->
    <ul class="list-none p-0 max-w-3xl mx-auto">
      <li
        v-for="(movie, index) in paginatedMovies"
        :key="movie.id"
        class="border-2 border-blue-500 rounded-lg p-4 mb-5 shadow-md bg-slate-800 w-11/12 mx-auto"
      >
        <div class="flex justify-between items-center mb-2 border-b border-blue-500 pb-2">
          <h2
            class="font-sans font-extrabold m-0 text-blue-500 tracking-tight flex items-center gap-2.5 text-2xl"
          >
            {{ movie.title }}
            <span class="text-xl ml-1.5">{{
              moviesStore.getMovieClassification(movie.releaseDate)
            }}</span>
          </h2>
          <button
            @click="removeMovie(index)"
            class="w-[100px] h-[30px] bg-blue-500 text-white border-none rounded-xl text-sm cursor-pointer flex items-center justify-center p-0 transition duration-200 ease-in-out hover:bg-blue-600"
          >
            Remove
          </button>
        </div>
        <div class="pt-2 flex items-start">
          <img
            :src="movie.poster"
            :alt="movie.title"
            class="max-w-[120px] h-auto mr-4 rounded shadow-md border border-blue-500"
          />
          <div class="flex flex-col justify-around flex-1">
            <p class="my-1.5 text-gray-200">
              <strong class="text-blue-500">Rating: </strong>
              <span v-if="editingRating !== index">{{ movie.rating }}/10</span>
              <span v-else>
                <input
                  type="number"
                  v-model="newRating"
                  min="0"
                  max="10"
                  step="0.1"
                  class="w-[60px] p-1 border border-blue-500 rounded bg-slate-800 text-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />/10
                <button
                  @click="updateRating(index)"
                  class="ml-2.5 py-1 px-2 bg-blue-500 text-white border-none rounded cursor-pointer text-xs transition duration-200 ease-in-out hover:bg-blue-600"
                >
                  Confirm
                </button>
                <button
                  @click="editingRating = null"
                  class="bg-red-500 hover:bg-red-600 ml-1.5 py-1 px-2 text-white border-none rounded cursor-pointer text-xs transition duration-200 ease-in-out"
                >
                  Cancel
                </button>
              </span>
              <button
                v-if="editingRating !== index"
                @click="startEditRating(index, movie.rating)"
                class="ml-2.5 py-1 px-2 bg-blue-500 text-white border-none rounded cursor-pointer text-xs transition duration-200 ease-in-out hover:bg-blue-600"
              >
                Edit Rating
              </button>
            </p>
            <p class="my-1.5 text-gray-200">
              <strong class="text-blue-500">Director:</strong> {{ movie.director }}
            </p>
            <p class="my-1.5 text-gray-200">
              <strong class="text-blue-500">Release Year:</strong>
              {{ new Date(movie.releaseDate).getFullYear() }}
            </p>
            <p class="mt-2.5 italic leading-snug text-gray-400">{{ movie.description }}</p>
          </div>
        </div>
      </li>
    </ul>

    <!-- Pagination controls (Keep) -->
    <div
      class="max-w-3xl mx-auto flex justify-center items-center gap-2 mt-5 mb-5"
      v-if="totalPages > 1"
    >
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="bg-slate-700 text-blue-500 py-2 px-4 rounded border border-transparent hover:bg-slate-600 hover:border-blue-500 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <template v-for="(page, index) in paginationButtons" :key="index">
        <button
          v-if="page !== '...'"
          @click="goToPage(page)"
          :class="[
            'py-2 px-4 rounded border transition duration-200 ease-in-out',
            currentPage === page
              ? 'bg-blue-500 text-white border-blue-500 cursor-default'
              : 'bg-slate-700 text-blue-500 border-transparent hover:bg-slate-600 hover:border-blue-500',
          ]"
        >
          {{ page }}
        </button>
        <span v-else class="text-gray-500 px-2">...</span>
      </template>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="bg-slate-700 text-blue-500 py-2 px-4 rounded border border-transparent hover:bg-slate-600 hover:border-blue-500 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>

    <!-- Add Movie Button (Keep this - for adding to personal list) -->
    <div class="max-w-3xl mx-auto text-center my-8">
      <router-link
        to="/add-movie"
        class="bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-bold no-underline transition duration-200 ease-in-out border-none cursor-pointer text-center shadow-md hover:bg-blue-600 inline-block"
      >
        Add Movie to My List
      </router-link>
    </div>
  </div>
</template>

<!-- css -->
<style scoped>
/* Styles can be adjusted if needed */
</style>
