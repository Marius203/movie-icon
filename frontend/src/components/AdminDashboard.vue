<!-- javascript -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMoviesStore } from '@/stores/movies'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const moviesStore = useMoviesStore()
const adminStore = useAdminStore()

// Check if admin is logged in
if (!adminStore.isAdmin) {
  router.push('/login')
}

onMounted(() => {
  moviesStore.fetchMovies()
})

// Movie being edited
const editingMovie = ref(null)
const editedMovie = ref({
  title: '',
  director: '',
  releaseDate: '',
  rating: '',
  description: '',
  poster: '',
})

// Form validation errors
const errors = ref({})

// Control showing the add movie form
const showAddMovieForm = ref(false)

// New movie object
const newMovie = ref({
  title: '',
  director: '',
  releaseDate: '',
  rating: '',
  description: '',
  poster: '',
})

// Start editing a movie
const startEdit = (movie) => {
  editingMovie.value = movie
  editedMovie.value = { ...movie }
}

// Cancel editing
const cancelEdit = () => {
  editingMovie.value = null
  editedMovie.value = {
    title: '',
    director: '',
    releaseDate: '',
    rating: '',
    description: '',
    poster: '',
  }
  errors.value = {}
}

// Validate movie data
const validateMovie = (movie) => {
  errors.value = {}

  if (!movie.title.trim()) {
    errors.value.title = 'Title is required'
  }

  if (!movie.director.trim()) {
    errors.value.director = 'Director is required'
  }

  if (!movie.releaseDate) {
    errors.value.releaseDate = 'Release date is required'
  }

  if (!movie.rating) {
    errors.value.rating = 'Rating is required'
  } else if (isNaN(movie.rating) || movie.rating < 0 || movie.rating > 10) {
    errors.value.rating = 'Rating must be a number between 0 and 10'
  }

  if (!movie.description.trim()) {
    errors.value.description = 'Description is required'
  }

  if (!movie.poster.trim()) {
    errors.value.poster = 'Poster URL is required'
  } else if (!isValidUrl(movie.poster)) {
    errors.value.poster = 'Please enter a valid URL'
  }

  return Object.keys(errors.value).length === 0
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

// Save edited movie
const saveEdit = async () => {
  if (validateMovie(editedMovie.value)) {
    try {
      // Call the API to update the movie
      await moviesStore.updateMovieAPI(editingMovie.value.id, editedMovie.value)

      // Success notification
      alert('Movie updated successfully!')

      // Close edit mode
      cancelEdit()
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update movie. Please try again.')
    }
  }
}

const deleteMovie = async (movie) => {
  console.log('Movie to delete:', movie) // Add this line
  if (confirm('Are you sure you want to delete this movie?')) {
    try {
      // Call the API to delete the movie
      await moviesStore.deleteMovieAPI(movie.id)
      // Success notification
      alert('Movie deleted successfully!')
    } catch (error) {
      console.error('Delete error details:', error) // Add this for better debugging
      alert('Failed to delete movie. Please try again.')
    }
  }
}

// Toggle add movie form
const toggleAddMovieForm = () => {
  showAddMovieForm.value = !showAddMovieForm.value
  if (!showAddMovieForm.value) {
    // Reset form when hiding
    newMovie.value = {
      title: '',
      director: '',
      releaseDate: '',
      rating: '',
      description: '',
      poster: '',
    }
    errors.value = {}
  }
}

// Add a new movie
const addMovie = async () => {
  if (validateMovie(newMovie.value)) {
    try {
      // Convert rating to number before saving
      const movieToAdd = {
        ...newMovie.value,
        rating: parseFloat(newMovie.value.rating),
      }
      await moviesStore.addMovieAPI(movieToAdd)
      // Clear form and hide it
      toggleAddMovieForm()
      // Show success notification
      alert('Movie added successfully!')
    } catch (error) {
      alert('Failed to add movie. Please try again.')
    }
  }
}

// Handle logout
const handleLogout = () => {
  adminStore.logout()
  router.push('/login')
}
</script>

<!-- html -->
<template>
  <div class="min-h-screen bg-slate-900 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-red-600">Admin Dashboard</h1>
        <button
          @click="handleLogout"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      <!-- Add Movie Button -->
      <div class="mb-6">
        <button
          @click="toggleAddMovieForm"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
        >
          <span class="mr-2">{{ showAddMovieForm ? 'Cancel' : 'Add New Movie' }}</span>
          <span v-if="!showAddMovieForm">+</span>
          <span v-else>×</span>
        </button>
      </div>

      <!-- Add Movie Form -->
      <div
        v-if="showAddMovieForm"
        class="bg-slate-800 rounded-lg shadow-lg p-6 border-2 border-green-600 mb-6"
      >
        <h2 class="text-xl font-semibold text-green-600 mb-4">Add New Movie</h2>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300">Title</label>
              <input
                v-model="newMovie.title"
                type="text"
                class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-green-600 rounded-md text-white"
                :class="{ 'border-red-500': errors.title }"
              />
              <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">Director</label>
              <input
                v-model="newMovie.director"
                type="text"
                class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-green-600 rounded-md text-white"
                :class="{ 'border-red-500': errors.director }"
              />
              <p v-if="errors.director" class="text-red-500 text-sm mt-1">{{ errors.director }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">Release Date</label>
              <input
                v-model="newMovie.releaseDate"
                type="date"
                class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-green-600 rounded-md text-white"
                :class="{ 'border-red-500': errors.releaseDate }"
              />
              <p v-if="errors.releaseDate" class="text-red-500 text-sm mt-1">
                {{ errors.releaseDate }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">Rating</label>
              <input
                v-model="newMovie.rating"
                type="number"
                step="0.1"
                min="0"
                max="10"
                class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-green-600 rounded-md text-white"
                :class="{ 'border-red-500': errors.rating }"
              />
              <p v-if="errors.rating" class="text-red-500 text-sm mt-1">{{ errors.rating }}</p>
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                v-model="newMovie.description"
                rows="3"
                class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-green-600 rounded-md text-white"
                :class="{ 'border-red-500': errors.description }"
              ></textarea>
              <p v-if="errors.description" class="text-red-500 text-sm mt-1">
                {{ errors.description }}
              </p>
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-300">Poster URL</label>
              <input
                v-model="newMovie.poster"
                type="text"
                class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-green-600 rounded-md text-white"
                :class="{ 'border-red-500': errors.poster }"
              />
              <p v-if="errors.poster" class="text-red-500 text-sm mt-1">{{ errors.poster }}</p>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              @click="addMovie"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Add Movie
            </button>
          </div>
        </div>
      </div>

      <!-- Movie List -->
      <div class="bg-slate-800 rounded-lg shadow-lg p-6 border-2 border-red-600">
        <h2 class="text-xl font-semibold text-red-600 mb-4">Manage Movies</h2>

        <div class="space-y-4">
          <div
            v-for="movie in moviesStore.movies"
            :key="movie.title + movie.director"
            class="bg-slate-700 p-4 rounded-lg"
          >
            <!-- View Mode -->
            <div v-if="editingMovie !== movie" class="flex justify-between items-start">
              <div class="flex gap-4">
                <img
                  :src="movie.poster"
                  :alt="movie.title"
                  class="w-24 h-36 object-cover rounded"
                />
                <div>
                  <h3 class="text-xl font-bold text-white">{{ movie.title }}</h3>
                  <p class="text-gray-300">Director: {{ movie.director }}</p>
                  <p class="text-gray-300">Release Date: {{ movie.releaseDate }}</p>
                  <p class="text-gray-300">Rating: {{ movie.rating }}/10</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="startEdit(movie)"
                  class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  @click="deleteMovie(movie)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            <!-- Edit Mode -->
            <div v-else class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300">Title</label>
                  <input
                    v-model="editedMovie.title"
                    type="text"
                    class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-red-600 rounded-md text-white"
                    :class="{ 'border-red-500': errors.title }"
                  />
                  <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300">Director</label>
                  <input
                    v-model="editedMovie.director"
                    type="text"
                    class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-red-600 rounded-md text-white"
                    :class="{ 'border-red-500': errors.director }"
                  />
                  <p v-if="errors.director" class="text-red-500 text-sm mt-1">
                    {{ errors.director }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300">Release Date</label>
                  <input
                    v-model="editedMovie.releaseDate"
                    type="date"
                    class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-red-600 rounded-md text-white"
                    :class="{ 'border-red-500': errors.releaseDate }"
                  />
                  <p v-if="errors.releaseDate" class="text-red-500 text-sm mt-1">
                    {{ errors.releaseDate }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300">Rating</label>
                  <input
                    v-model="editedMovie.rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-red-600 rounded-md text-white"
                    :class="{ 'border-red-500': errors.rating }"
                  />
                  <p v-if="errors.rating" class="text-red-500 text-sm mt-1">{{ errors.rating }}</p>
                </div>

                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-300">Description</label>
                  <textarea
                    v-model="editedMovie.description"
                    rows="3"
                    class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-red-600 rounded-md text-white"
                    :class="{ 'border-red-500': errors.description }"
                  ></textarea>
                  <p v-if="errors.description" class="text-red-500 text-sm mt-1">
                    {{ errors.description }}
                  </p>
                </div>

                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-300">Poster URL</label>
                  <input
                    v-model="editedMovie.poster"
                    type="text"
                    class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-red-600 rounded-md text-white"
                    :class="{ 'border-red-500': errors.poster }"
                  />
                  <p v-if="errors.poster" class="text-red-500 text-sm mt-1">{{ errors.poster }}</p>
                </div>
              </div>

              <div class="flex justify-end gap-2">
                <button
                  @click="cancelEdit"
                  class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="saveEdit"
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
