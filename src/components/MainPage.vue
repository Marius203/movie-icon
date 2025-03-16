<!-- javascript -->
<script setup>
import { ref, computed } from 'vue'
import { useMoviesStore } from '@/stores/movies'

const moviesStore = useMoviesStore()

// Pagination
const currentPage = ref(1)
const moviesPerPage = 5

// Use the sortedMovies computed property from the store
const movies = computed(() => moviesStore.sortedMovies)

// Calculate paginated movies
const paginatedMovies = computed(() => {
  const startIndex = (currentPage.value - 1) * moviesPerPage
  const endIndex = startIndex + moviesPerPage
  return movies.value.slice(startIndex, endIndex)
})

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(movies.value.length / moviesPerPage)
})

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
    const actualIndex = (currentPage.value - 1) * moviesPerPage + index
    moviesStore.updateMovieRating(actualIndex, parseFloat(newRating.value))
    editingRating.value = null
  } else {
    alert('Rating must be between 0 and 10')
  }
}

const removeMovie = (index) => {
  if (confirm('Are you sure you want to delete this movie?')) {
    // Calculate the actual index in the entire sorted list
    const actualIndex = (currentPage.value - 1) * moviesPerPage + index
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

  <ul>
    <li v-for="(movie, index) in paginatedMovies" :key="index">
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">{{ movie.title }}</h2>
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
</template>

<!-- css -->
<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');

/* Movie count style */
.movie-count {
  text-align: center;
  color: #666;
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
  background-color: #8b0000;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.pagination-btn:hover:not(.disabled) {
  background-color: #6b0000;
}

.pagination-btn.disabled {
  background-color: #ccc;
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
  background-color: white;
  color: #8b0000;
  border: 1px solid #8b0000;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-number:hover {
  background-color: #fff5f5;
}

.page-number.active {
  background-color: #8b0000;
  color: white;
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
  background-color: white;
  color: #8b0000;
  border: 2px solid #8b0000;
  border-radius: 6px;
  padding: 8px 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  background-color: #fff5f5;
}

.sort-btn.active {
  background-color: #8b0000;
  color: white;
}

.sort-btn.reset {
  background-color: #f8f8f8;
  color: #666;
  border-color: #ccc;
}

.sort-btn.reset:hover {
  background-color: #eee;
}

.sort-btn.reset.active {
  background-color: #666;
  color: white;
  border-color: #666;
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
  background-color: #8b0000;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  text-decoration: none;
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 3px 6px rgba(139, 0, 0, 0.2);
}

.add-movie-btn:hover {
  background-color: #6b0000;
}

body {
  background-color: #fff5f5;
  color: #333;
  font-family: Arial, sans-serif;
}

/* Center content in a container */
ul {
  list-style-type: none;
  padding-left: 0;
  max-width: 800px; /* Control the maximum width */
  margin: 0 auto; /* Center the container */
}

.card {
  border: 2px solid #8b0000;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px; /* Slightly more space between cards */
  box-shadow: 0 3px 6px rgba(139, 0, 0, 0.2);
  background-color: white;
  width: 90%; /* Make cards narrower */
  margin-left: auto;
  margin-right: auto;
}

h1 {
  font-family: 'Open Sans', sans-serif;
  font-weight: 700;
  text-align: center;
  color: #8b0000;
  margin-bottom: 30px;
  font-size: 2.5em;
  padding-bottom: 10px;
  border-bottom: 2px solid #8b0000;
  text-shadow: 1px 1px 2px rgba(139, 0, 0, 0.1);
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
  border-bottom: 1px solid #ffcccc;
  padding-bottom: 8px;
}

.card__title {
  font-family: 'Open Sans', sans-serif;
  font-weight: 800;
  margin: 0;
  color: #8b0000;
  letter-spacing: 0.3px;
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
  box-shadow: 0 2px 4px rgba(139, 0, 0, 0.2);
  border: 1px solid #ffcccc;
}

.movie-details {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  flex: 1;
}

.movie-details p {
  margin: 5px 0;
}

.movie-details strong {
  color: #a52a2a;
}

.description {
  margin-top: 10px;
  font-style: italic;
  line-height: 1.4;
  color: #555;
}

.delete-btn {
  width: 100px;
  height: 30px;
  background-color: #8b0000;
  color: white;
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
  background-color: #6b0000;
}

.update-btn {
  margin-left: 10px;
  padding: 3px 8px;
  background-color: #a52a2a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.update-btn:hover {
  background-color: #8b0000;
}

.update-btn.confirm {
  background-color: #a52a2a;
}

.update-btn.confirm:hover {
  background-color: #8b0000;
}

.update-btn.cancel {
  background-color: #cd5c5c;
  margin-left: 5px;
}

.update-btn.cancel:hover {
  background-color: #b22222;
}

.rating-input {
  width: 60px;
  padding: 4px;
  border: 1px solid #cd5c5c;
  border-radius: 4px;
}
</style>
