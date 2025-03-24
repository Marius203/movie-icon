<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMoviesStore } from '@/stores/movies'

const router = useRouter()
const moviesStore = useMoviesStore()

// Form data
const newMovie = ref({
  title: '',
  director: '',
  releaseDate: '',
  rating: '',
  description: '',
  poster: '',
})

// Validation errors
const errors = ref({})

// Form submission
const submitForm = () => {
  // Reset errors
  errors.value = {}

  // Validate fields
  if (!newMovie.value.title.trim()) {
    errors.value.title = 'Title is required'
  }

  if (!newMovie.value.director.trim()) {
    errors.value.director = 'Director is required'
  }

  if (!newMovie.value.releaseDate) {
    errors.value.releaseDate = 'Release date is required'
  }

  if (!newMovie.value.rating) {
    errors.value.rating = 'Rating is required'
  } else if (
    isNaN(newMovie.value.rating) ||
    newMovie.value.rating < 0 ||
    newMovie.value.rating > 10
  ) {
    errors.value.rating = 'Rating must be a number between 0 and 10'
  }

  if (!newMovie.value.description.trim()) {
    errors.value.description = 'Description is required'
  }

  if (!newMovie.value.poster.trim()) {
    errors.value.poster = 'Poster URL is required'
  } else if (!isValidUrl(newMovie.value.poster)) {
    errors.value.poster = 'Please enter a valid URL'
  }

  // If no errors, proceed with submission
  if (Object.keys(errors.value).length === 0) {
    // Add the movie to the store
    moviesStore.addMovie({
      title: newMovie.value.title,
      director: newMovie.value.director,
      releaseDate: newMovie.value.releaseDate,
      rating: parseFloat(newMovie.value.rating),
      description: newMovie.value.description,
      poster: newMovie.value.poster,
    })

    // Navigate back to the movie list
    router.push('/')
  }
}

// Helper function to validate URL
const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

// Cancel and return to movie list
const cancelAdd = () => {
  router.push('/')
}
</script>

<template>
  <div class="form-container">
    <h1>Add New Movie</h1>

    <form @submit.prevent="submitForm" class="movie-form">
      <div class="form-group">
        <label for="title">Title:</label>
        <input
          type="text"
          id="title"
          v-model="newMovie.title"
          :class="{ 'error-input': errors.title }"
        />
        <span class="error-message" v-if="errors.title">{{ errors.title }}</span>
      </div>

      <div class="form-group">
        <label for="director">Director:</label>
        <input
          type="text"
          id="director"
          v-model="newMovie.director"
          :class="{ 'error-input': errors.director }"
        />
        <span class="error-message" v-if="errors.director">{{ errors.director }}</span>
      </div>

      <div class="form-group">
        <label for="releaseDate">Release Date:</label>
        <input
          type="date"
          id="releaseDate"
          v-model="newMovie.releaseDate"
          :class="{ 'error-input': errors.releaseDate }"
        />
        <span class="error-message" v-if="errors.releaseDate">{{ errors.releaseDate }}</span>
      </div>

      <div class="form-group">
        <label for="rating">Rating (0-10):</label>
        <input
          type="number"
          id="rating"
          v-model="newMovie.rating"
          step="0.1"
          min="0"
          max="10"
          :class="{ 'error-input': errors.rating }"
        />
        <span class="error-message" v-if="errors.rating">{{ errors.rating }}</span>
      </div>

      <div class="form-group">
        <label for="description">Description:</label>
        <textarea
          id="description"
          v-model="newMovie.description"
          rows="4"
          :class="{ 'error-input': errors.description }"
        ></textarea>
        <span class="error-message" v-if="errors.description">{{ errors.description }}</span>
      </div>

      <div class="form-group">
        <label for="poster">Poster URL:</label>
        <input
          type="text"
          id="poster"
          v-model="newMovie.poster"
          :class="{ 'error-input': errors.poster }"
        />
        <span class="error-message" v-if="errors.poster">{{ errors.poster }}</span>
      </div>

      <div class="form-buttons">
        <button type="button" class="cancel-btn" @click="cancelAdd">Cancel</button>
        <button type="submit" class="submit-btn">Add Movie</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(139, 0, 0, 0.2);
  border: 2px solid #8b0000;
}

h1 {
  font-family: 'Open Sans', sans-serif;
  font-weight: 700;
  text-align: center;
  color: #8b0000;
  margin-bottom: 30px;
  font-size: 2em;
  padding-bottom: 10px;
  border-bottom: 2px solid #8b0000;
}

.movie-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #555;
}

input,
textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.error-input {
  border-color: #ff0000;
  background-color: #fff0f0;
}

.error-message {
  color: #ff0000;
  font-size: 14px;
  margin-top: 5px;
}

.form-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-btn,
.cancel-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

.submit-btn {
  background-color: #8b0000;
  color: white;
  transition: background-color 0.2s ease;
}

.submit-btn:hover {
  background-color: #6b0000;
}

.cancel-btn {
  background-color: #ccc;
  color: #333;
  transition: background-color 0.2s ease;
}

.cancel-btn:hover {
  background-color: #999;
}
</style>