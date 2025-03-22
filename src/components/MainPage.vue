<!-- javascript -->
<script setup>
import { ref, computed } from 'vue'
import { useMoviesStore } from '@/stores/movies'
import MovieClassificationChart from './MovieClassificationChart.vue'

const moviesStore = useMoviesStore()

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

// For editing ratings
const editingRating = ref(null)
const newRating = ref(0)

const startEditRating = (index, currentRating) => {
  editingRating.value = index
  newRating.value = currentRating
}

const updateRating = (index) => {
  if (newRating.value >= 0 && newRating.value <= 10) {
    // Calculate the actual index in the entire sorted list
    const actualIndex = (currentPage.value - 1) * moviesStore.moviesPerPage + index
    moviesStore.updateMovieRating(actualIndex, parseFloat(newRating.value))
    editingRating.value = null
  } else {
    alert('Rating must be between 0 and 10')
  }
}

const removeMovie = (index) => {
  if (confirm('Are you sure you want to delete this movie?')) {
    // Calculate the actual index in the entire sorted list
    const actualIndex = (currentPage.value - 1) * moviesStore.moviesPerPage + index
    moviesStore.removeMovie(actualIndex)

    // If the current page is now empty (except for the last page), go to the previous page
    if (currentPage.value > 1 && paginatedMovies.value.length === 0) {
      currentPage.value--
    }
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
</script>

<!-- html -->
<template>
  <h1>Your Movies</h1>

  <!-- Movie Classification Chart -->
  <MovieClassificationChart />

  <!-- Main content wrapper -->
  <div class="main-content">
    <!-- Sorting controls -->
    <div class="sorting-controls">
      <button
        @click="sortByTitle()"
        class="sort-btn"
        :class="{
          active: moviesStore.sortOption === 'titleAsc' || moviesStore.sortOption === 'titleDesc',
        }"
      >
        Sort by Title
        <span v-if="moviesStore.sortOption === 'titleAsc'">▲</span>
        <span v-else-if="moviesStore.sortOption === 'titleDesc'">▼</span>
      </button>

      <button
        @click="sortByRating()"
        class="sort-btn"
        :class="{
          active: moviesStore.sortOption === 'ratingAsc' || moviesStore.sortOption === 'ratingDesc',
        }"
      >
        Sort by Rating
        <span v-if="moviesStore.sortOption === 'ratingAsc'">▲</span>
        <span v-else-if="moviesStore.sortOption === 'ratingDesc'">▼</span>
      </button>

      <button
        @click="resetSort()"
        class="sort-btn reset"
        :class="{ active: moviesStore.sortOption === 'default' }"
      >
        Reset Sort
      </button>
    </div>

    <!-- Movie count display -->
    <p class="movie-count">
      Showing {{ paginatedMovies.length }} of {{ movies.length }} movies (Page {{ currentPage }} of
      {{ totalPages }})
    </p>

    <!-- Movies per page selector -->
    <div class="movies-per-page">
      <label for="moviesPerPage">Movies per page:</label>
      <select
        id="moviesPerPage"
        v-model="moviesStore.moviesPerPage"
        @change="handleMoviesPerPageChange($event.target.value)"
        class="movies-per-page-select"
      >
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>
    </div>

    <ul>
      <li v-for="(movie, index) in paginatedMovies" :key="index">
        <div class="card">
          <div class="card__header">
            <h2 class="card__title">
              {{ movie.title }}
              <span class="classification-emoji">{{ moviesStore.getMovieClassification(movie.releaseDate) }}</span>
            </h2>
            <button class="delete-btn" @click="removeMovie(index)">Delete movie</button>
          </div>
          <div class="card__content">
            <img :src="movie.poster" :alt="movie.title" />
            <div class="movie-details">
              <p><strong>Director:</strong> {{ movie.director }}</p>
              <p><strong>Released:</strong> {{ movie.releaseDate }}</p>
              <p>
                <strong>Rating: </strong>
                <template v-if="editingRating === index">
                  <input
                    type="number"
                    v-model="newRating"
                    min="0"
                    max="10"
                    step="0.1"
                    class="rating-input"
                  />
                  <button class="update-btn confirm" @click="updateRating(index)">Save</button>
                  <button class="update-btn cancel" @click="editingRating = null">Cancel</button>
                </template>
                <template v-else>
                  {{ movie.rating }}/10
                  <button class="update-btn" @click="startEditRating(index, movie.rating)">
                    Update
                  </button>
                </template>
              </p>
              <p class="description"><strong>Description:</strong> {{ movie.description }}</p>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <!-- Pagination controls -->
    <div class="pagination-controls" v-if="totalPages > 1">
      <button
        @click="prevPage"
        class="pagination-btn"
        :disabled="currentPage === 1"
        :class="{ disabled: currentPage === 1 }"
      >
        Previous
      </button>

      <div class="page-numbers">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          class="page-number"
          :class="{ active: currentPage === page }"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="nextPage"
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        :class="{ disabled: currentPage === totalPages }"
      >
        Next
      </button>
    </div>

    <div class="add-movie-container">
      <router-link to="/add-movie" class="add-movie-btn">Add Movie</router-link>
    </div>
  </div>
</template>

<!-- css -->
<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');

/* Movie count style */
.movie-count {
  text-align: center;
  color: #cccccc;
  font-style: italic;
  margin-bottom: 20px;
}

/* Pagination controls style */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
}

.pagination-btn {
  padding: 8px 16px;
  background-color: #d4af37;
  color: #1a1f3c;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.pagination-btn:hover:not(.disabled) {
  background-color: #c19b2e;
}

.pagination-btn.disabled {
  background-color: #4a4f6c;
  color: #8a8a8a;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2a2f4c;
  color: #d4af37;
  border: 1px solid #d4af37;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-number:hover {
  background-color: #3a3f5c;
}

.page-number.active {
  background-color: #d4af37;
  color: #1a1f3c;
}

/* Sorting controls style */
.sorting-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.sort-btn {
  background-color: #2a2f4c;
  color: #d4af37;
  border: 2px solid #d4af37;
  border-radius: 6px;
  padding: 8px 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  background-color: #3a3f5c;
}

.sort-btn.active {
  background-color: #d4af37;
  color: #1a1f3c;
}

.sort-btn.reset {
  background-color: #2a2f4c;
  color: #8a8a8a;
  border-color: #4a4f6c;
}

.sort-btn.reset:hover {
  background-color: #3a3f5c;
}

.sort-btn.reset.active {
  background-color: #4a4f6c;
  color: #e6e6e6;
  border-color: #4a4f6c;
}

.add-movie-container {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.add-movie-btn {
  background-color: #d4af37;
  color: #1a1f3c;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  text-decoration: none;
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 3px 6px rgba(212, 175, 55, 0.2);
}

.add-movie-btn:hover {
  background-color: #c19b2e;
}

body {
  background-color: #1a1f3c; /* Dark blue background */
  color: #e6e6e6; /* Light gray text */
  font-family: Arial, sans-serif;
}

/* Center content in a container */
ul {
  list-style-type: none;
  padding-left: 0;
  max-width: 800px;
  margin: 0 auto;
  padding-right: 0; /* Remove right padding */
}

/* Add responsive padding for smaller screens */
@media (max-width: 1000px) {
  ul {
    padding-right: 0;
  }
  
  .chart-container {
    display: none; /* Hide chart on smaller screens */
  }
}

/* Center all content containers */
.sorting-controls,
.movie-count,
.movies-per-page,
.pagination-controls,
.add-movie-container {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding-right: 0; /* Remove right padding */
}

@media (max-width: 1000px) {
  .sorting-controls,
  .movie-count,
  .movies-per-page,
  .pagination-controls,
  .add-movie-container {
    padding-right: 0;
  }
}

/* Add a wrapper for the main content */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding-right: 0;
}

/* Update chart container position */
.chart-container {
  position: fixed;
  right: 20px;
  top: 100px;
  z-index: 100;
}

.card {
  border: 2px solid #d4af37; /* Darker gold border */
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 3px 6px rgba(212, 175, 55, 0.2);
  background-color: #2a2f4c;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
}

h1 {
  font-family: 'Open Sans', sans-serif;
  font-weight: 700;
  text-align: center;
  color: #d4af37; /* Darker gold */
  margin-bottom: 30px;
  font-size: 2.5em;
  padding-bottom: 10px;
  border-bottom: 2px solid #d4af37;
  text-shadow: 1px 1px 2px rgba(212, 175, 55, 0.2);
  letter-spacing: 0.5px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px solid #d4af37;
  padding-bottom: 8px;
}

.card__title {
  font-family: 'Open Sans', sans-serif;
  font-weight: 800;
  margin: 0;
  color: #d4af37;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.classification-emoji {
  font-size: 1.2em;
  margin-left: 5px;
}

.card__content {
  padding-top: 8px;
  display: flex;
  align-items: flex-start;
}

.card__content img {
  max-width: 120px;
  height: auto;
  margin-right: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(212, 175, 55, 0.2);
  border: 1px solid #d4af37;
}

.movie-details {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  flex: 1;
}

.movie-details p {
  margin: 5px 0;
  color: #e6e6e6;
}

.movie-details strong {
  color: #d4af37;
}

.description {
  margin-top: 10px;
  font-style: italic;
  line-height: 1.4;
  color: #cccccc;
}

.delete-btn {
  width: 100px;
  height: 30px;
  background-color: #d4af37;
  color: #1a1f3c;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background-color 0.2s ease;
}

.delete-btn:hover {
  background-color: #c19b2e;
}

.update-btn {
  margin-left: 10px;
  padding: 3px 8px;
  background-color: #d4af37;
  color: #1a1f3c;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.update-btn:hover {
  background-color: #c19b2e;
}

.update-btn.confirm {
  background-color: #d4af37;
}

.update-btn.confirm:hover {
  background-color: #c19b2e;
}

.update-btn.cancel {
  background-color: #ff6b6b;
  margin-left: 5px;
}

.update-btn.cancel:hover {
  background-color: #ff5252;
}

.rating-input {
  width: 60px;
  padding: 4px;
  border: 1px solid #d4af37;
  border-radius: 4px;
  background-color: #2a2f4c;
  color: #d4af37;
}

/* Movies per page selector styles */
.movies-per-page {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.movies-per-page label {
  color: #cccccc;
  font-weight: 600;
}

.movies-per-page-select {
  padding: 8px 12px;
  border: 2px solid #d4af37;
  border-radius: 6px;
  background-color: #2a2f4c;
  color: #d4af37;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.movies-per-page-select:hover {
  background-color: #3a3f5c;
}

.movies-per-page-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
}

.movies-per-page-select option {
  background-color: #2a2f4c;
  color: #d4af37;
}
</style>