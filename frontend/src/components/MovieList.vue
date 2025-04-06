<!-- javascript -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMoviesStore } from '@/stores/movies'
import { useUsersStore } from '@/stores/users'
import MovieDetailsPopup from './MovieDetailsPopup.vue'
// import MovieClassificationChart from './MovieClassificationChart.vue'

const moviesStore = useMoviesStore()
const userMoviesStore = useUsersStore()

// Popup state
const selectedMovie = ref(null)
const isPopupOpen = ref(false)

// Pagination
const currentPage = ref(1)

// Use the sortedMovies computed property from the store
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
  currentPage.value = 1 // Reset to first page when changing items per page
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

// Sorting functions
const sortByTitle = () => {
  if (moviesStore.sortOption === 'titleAsc') {
    moviesStore.setSortOption('titleDesc')
  } else {
    moviesStore.setSortOption('titleAsc')
  }
  // Reset to first page when sorting changes
  currentPage.value = 1
}

const sortByRating = () => {
  if (moviesStore.sortOption === 'ratingAsc') {
    moviesStore.setSortOption('ratingDesc')
  } else {
    moviesStore.setSortOption('ratingAsc')
  }
  // Reset to first page when sorting changes
  currentPage.value = 1
}

const resetSort = () => {
  moviesStore.setSortOption('default')
  // Reset to first page when sorting changes
  currentPage.value = 1
}

// Add this computed property for pagination buttons
const paginationButtons = computed(() => {
  const buttons = []
  const maxVisiblePages = 5

  if (totalPages.value <= maxVisiblePages) {
    // If total pages is less than or equal to max visible pages, show all
    for (let i = 1; i <= totalPages.value; i++) {
      buttons.push(i)
    }
  } else {
    // Always show first page
    buttons.push(1)

    // Calculate start and end of visible range
    let start = Math.max(2, currentPage.value - 1)
    let end = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Adjust if we're near the start
    if (currentPage.value <= 3) {
      start = 2
      end = 4
    }
    // Adjust if we're near the end
    else if (currentPage.value >= totalPages.value - 2) {
      start = totalPages.value - 3
      end = totalPages.value - 1
    }

    // Add ellipsis after first page if needed
    if (start > 2) {
      buttons.push('...')
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      buttons.push(i)
    }

    // Add ellipsis before last page if needed
    if (end < totalPages.value - 1) {
      buttons.push('...')
    }

    // Always show last page
    buttons.push(totalPages.value)
  }

  return buttons
})

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
const handleStealMovie = (movie) => {
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
  userMoviesStore.addMovie(movieCopy)
  alert(`${movie.title} 'stolen' and added to your personal list!`)
  handlePopupClose()
}
</script>

<!-- html -->
<template>
  <!-- Add a title specific to this page -->
  <h1
    class="font-sans font-bold text-center text-yellow-600 mb-8 text-4xl pb-2.5 border-b-2 border-yellow-600 tracking-wide max-w-3xl mx-auto"
  >
    Browse All Movies
  </h1>

  <!-- Movie Classification Chart -->
  <MovieClassificationChart />

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
      Total Movies: {{ movies.length }}
    </div>

    <!-- Movies per page selector -->
    <div class="max-w-3xl mx-auto flex items-center justify-center gap-2.5 mb-5">
      <label for="moviesPerPage" class="text-gray-300 font-semibold">Movies per page:</label>
      <select
        id="moviesPerPage"
        :value="moviesStore.moviesPerPage"
        @change="handleMoviesPerPageChange($event.target.value)"
        class="bg-slate-700 border border-yellow-600 text-yellow-600 rounded py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
      </select>
    </div>

    <!-- Movie list -->
    <ul class="list-none p-0 max-w-3xl mx-auto">
      <li
        v-for="(movie, index) in paginatedMovies"
        :key="movie.id"
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
            :disabled="
              userMoviesStore.userMovies.some(
                (m) =>
                  m.title === movie.title &&
                  m.director === movie.director &&
                  m.releaseDate === movie.releaseDate,
              )
            "
            class="px-2 py-1 text-sm rounded transition-colors"
            :class="
              userMoviesStore.userMovies.some(
                (m) =>
                  m.title === movie.title &&
                  m.director === movie.director &&
                  m.releaseDate === movie.releaseDate,
              )
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            "
          >
            {{
              userMoviesStore.userMovies.some(
                (m) =>
                  m.title === movie.title &&
                  m.director === movie.director &&
                  m.releaseDate === movie.releaseDate,
              )
                ? 'Already Stolen'
                : 'Steal this'
            }}
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

    <!-- Pagination controls -->
    <div
      class="max-w-3xl mx-auto flex justify-center items-center gap-2 mt-5 mb-5"
      v-if="totalPages > 1"
    >
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="bg-slate-700 text-yellow-600 py-2 px-4 rounded border border-transparent hover:bg-slate-600 hover:border-yellow-600 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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
              ? 'bg-yellow-600 text-slate-900 border-yellow-600 cursor-default'
              : 'bg-slate-700 text-yellow-600 border-transparent hover:bg-slate-600 hover:border-yellow-600',
          ]"
        >
          {{ page }}
        </button>
        <span v-else class="text-gray-500 px-2">...</span>
      </template>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="bg-slate-700 text-yellow-600 py-2 px-4 rounded border border-transparent hover:bg-slate-600 hover:border-yellow-600 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
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

<!-- css -->
<style scoped>
/* Styles removed as they are replaced by Tailwind classes */
</style>
