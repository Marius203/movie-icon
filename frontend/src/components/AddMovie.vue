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
  <div class="max-w-xl mx-auto p-5 bg-white rounded-lg shadow-md border-2 border-red-800 mt-10">
    <h1
      class="font-sans font-bold text-center text-red-800 mb-8 text-2xl pb-2.5 border-b-2 border-red-800"
    >
      Add New Movie
    </h1>

    <form @submit.prevent="submitForm" class="flex flex-col gap-4">
      <div class="flex flex-col">
        <label for="title" class="font-semibold mb-1.5 text-gray-700">Title:</label>
        <input
          type="text"
          id="title"
          v-model="newMovie.title"
          class="p-2.5 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          :class="{ 'border-red-500 bg-red-50': errors.title }"
        />
        <span class="text-red-500 text-sm mt-1.5" v-if="errors.title">{{ errors.title }}</span>
      </div>

      <div class="flex flex-col">
        <label for="director" class="font-semibold mb-1.5 text-gray-700">Director:</label>
        <input
          type="text"
          id="director"
          v-model="newMovie.director"
          class="p-2.5 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          :class="{ 'border-red-500 bg-red-50': errors.director }"
        />
        <span class="text-red-500 text-sm mt-1.5" v-if="errors.director">{{
          errors.director
        }}</span>
      </div>

      <div class="flex flex-col">
        <label for="releaseDate" class="font-semibold mb-1.5 text-gray-700">Release Date:</label>
        <input
          type="date"
          id="releaseDate"
          v-model="newMovie.releaseDate"
          class="p-2.5 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          :class="{ 'border-red-500 bg-red-50': errors.releaseDate }"
        />
        <span class="text-red-500 text-sm mt-1.5" v-if="errors.releaseDate">{{
          errors.releaseDate
        }}</span>
      </div>

      <div class="flex flex-col">
        <label for="rating" class="font-semibold mb-1.5 text-gray-700">Rating (0-10):</label>
        <input
          type="number"
          id="rating"
          v-model="newMovie.rating"
          step="0.1"
          min="0"
          max="10"
          class="p-2.5 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          :class="{ 'border-red-500 bg-red-50': errors.rating }"
        />
        <span class="text-red-500 text-sm mt-1.5" v-if="errors.rating">{{ errors.rating }}</span>
      </div>

      <div class="flex flex-col">
        <label for="description" class="font-semibold mb-1.5 text-gray-700">Description:</label>
        <textarea
          id="description"
          v-model="newMovie.description"
          rows="4"
          class="p-2.5 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          :class="{ 'border-red-500 bg-red-50': errors.description }"
        ></textarea>
        <span class="text-red-500 text-sm mt-1.5" v-if="errors.description">{{
          errors.description
        }}</span>
      </div>

      <div class="flex flex-col">
        <label for="poster" class="font-semibold mb-1.5 text-gray-700">Poster URL:</label>
        <input
          type="text"
          id="poster"
          v-model="newMovie.poster"
          class="p-2.5 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          :class="{ 'border-red-500 bg-red-50': errors.poster }"
        />
        <span class="text-red-500 text-sm mt-1.5" v-if="errors.poster">{{ errors.poster }}</span>
      </div>

      <div class="flex justify-between mt-5">
        <button
          type="button"
          class="py-3 px-6 rounded-lg text-base font-bold border-none cursor-pointer transition duration-200 ease-in-out bg-gray-300 text-gray-800 hover:bg-gray-400"
          @click="cancelAdd"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="py-3 px-6 rounded-lg text-base font-bold border-none cursor-pointer transition duration-200 ease-in-out bg-red-800 text-white hover:bg-red-900"
        >
          Add Movie
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Styles removed as they are replaced by Tailwind classes */
</style>
