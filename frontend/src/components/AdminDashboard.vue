<!-- javascript -->
<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMoviesStore } from '@/stores/movies'
import { useAdminStore } from '@/stores/admin'
import { useConnectionStore } from '@/stores/connection'
import { localStorageService } from '@/services/localStorageService'
import { API_BASE_URL } from '@/config/api'

const router = useRouter()
const moviesStore = useMoviesStore()
const adminStore = useAdminStore()
const connectionStore = useConnectionStore()

// Track pending operations count
const pendingOperationsCount = ref(0)

// Check if admin is logged in
if (!adminStore.isAdmin) {
  router.push('/login')
}

// Add these variables after the existing refs
// Endless scrolling variables
const displayedMovies = ref([])
const offset = ref(0)
const limit = ref(20)
const loading = ref(false)
const noMoreMovies = ref(false)
const scrollActionPending = ref(false)

// Update the onMounted function to use pagination
onMounted(async () => {
  loading.value = true
  await moviesStore.fetchMovies(limit.value, offset.value)
  displayedMovies.value = [...moviesStore.movies]
  loading.value = false
  refreshPendingOperationsCount()

  // Add scroll event listener
  window.addEventListener('scroll', handleScroll)
})

// Add onUnmounted to clean up the event listener
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Function to detect scroll position
const handleScroll = async () => {
  const bottomOfWindow =
    document.documentElement.scrollTop + window.innerHeight >=
    document.documentElement.offsetHeight - 200

  if (bottomOfWindow && !loading.value && !noMoreMovies.value && !scrollActionPending.value) {
    scrollActionPending.value = true
    await delay(500) // Need to add the delay function

    if (!loading.value && !noMoreMovies.value) {
      loadMoreMovies()
    }

    scrollActionPending.value = false
  }
}

// Add delay helper function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Function to load more movies
const loadMoreMovies = async () => {
  if (loading.value || noMoreMovies.value) return

  loading.value = true
  offset.value += limit.value

  await moviesStore.fetchMovies(limit.value, offset.value)

  // If no more movies were returned, mark as finished
  if (moviesStore.movies.length === 0) {
    noMoreMovies.value = true
    loading.value = false
    return
  }

  // Add new movies to displayed movies
  displayedMovies.value = [...displayedMovies.value, ...moviesStore.movies]
  loading.value = false
}

// Function to refresh pending operations count
async function refreshPendingOperationsCount() {
  const pendingOps = await localStorageService.getPendingOperations()
  pendingOperationsCount.value = pendingOps.length
}

// Watch connection status to attempt sync when back online
watch(
  () => [connectionStore.isOnline, connectionStore.isServerAvailable],
  async ([newIsOnline, newIsServerAvailable]) => {
    if (newIsOnline && newIsServerAvailable) {
      if (pendingOperationsCount.value > 0) {
        await syncPendingChanges()
      }
    }
  },
)

// Function to manually sync pending changes
async function syncPendingChanges() {
  try {
    await moviesStore.syncWithServer()
    await refreshList() // Use the new refresh function
    await refreshPendingOperationsCount()
    if (pendingOperationsCount.value === 0) {
      alert('All pending changes synchronized successfully!')
    } else {
      alert('Some changes could not be synchronized. Please try again later.')
    }
  } catch (error) {
    console.error('Sync error:', error)
    alert('Error synchronizing changes. Please try again.')
  }
}

// Add this function to the script section
async function clearPendingChanges() {
  if (
    confirm('Are you sure you want to clear all pending changes? This action cannot be undone.')
  ) {
    try {
      await localStorageService.clearPendingOperations()
      await refreshPendingOperationsCount()
      alert('All pending changes have been cleared.')
    } catch (error) {
      console.error('Error clearing pending changes:', error)
      alert('Error clearing pending changes.')
    }
  }
}

// Update the refresh function to reset pagination
async function refreshList() {
  offset.value = 0
  loading.value = true
  noMoreMovies.value = false
  await moviesStore.fetchMovies(limit.value, 0)
  displayedMovies.value = [...moviesStore.movies]
  loading.value = false
}

// Movie being edited
const editingMovie = ref(null)
const editedMovie = ref({
  title: '',
  director: '',
  releaseDate: '',
  rating: '',
  description: '',
  poster: '',
  trailer: null,
})

// Add for handling trailer files
const trailerFile = ref(null)
const trailerPreview = ref(null)

// Handle trailer file selection for edit form
const handleEditTrailerUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    trailerFile.value = file
    trailerPreview.value = URL.createObjectURL(file)
  } else {
    trailerFile.value = null
    trailerPreview.value = null
  }
}

// Form validation errors
const errors = ref({})

// Control showing the add movie form
const showAddMovieForm = ref(false)

// New movie object with trailer
const newMovie = ref({
  title: '',
  director: '',
  releaseDate: '',
  rating: '',
  description: '',
  poster: '',
})

// For new movie trailer
const newMovieTrailerFile = ref(null)
const newMovieTrailerPreview = ref(null)

// Handle trailer file selection for new movie form
const handleNewTrailerUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    newMovieTrailerFile.value = file
    newMovieTrailerPreview.value = URL.createObjectURL(file)
  } else {
    newMovieTrailerFile.value = null
    newMovieTrailerPreview.value = null
  }
}

// Start editing a movie
const startEdit = (movie) => {
  editingMovie.value = movie
  editedMovie.value = { ...movie }
  trailerPreview.value = movie.trailer ? movie.trailer : null
  trailerFile.value = null // Reset file input
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
    trailer: null,
  }
  trailerFile.value = null
  trailerPreview.value = null
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
      if (trailerFile.value) {
        // Handle with trailer upload
        const formData = new FormData()
        formData.append('title', editedMovie.value.title)
        formData.append('director', editedMovie.value.director)
        formData.append('releaseDate', editedMovie.value.releaseDate)
        formData.append('rating', editedMovie.value.rating)
        formData.append('description', editedMovie.value.description)
        formData.append('poster', editedMovie.value.poster)
        formData.append('trailer', trailerFile.value)

        await moviesStore.updateMovieWithTrailer(editingMovie.value.id, formData)
      } else {
        // Regular update without changing trailer
        await moviesStore.updateMovieAPI(editingMovie.value.id, editedMovie.value)
      }

      // Update pending operations count
      await refreshPendingOperationsCount()

      // Different message based on connection status
      if (connectionStore.isOnline && connectionStore.isServerAvailable) {
        alert('Movie updated successfully!')
      } else {
        alert('Movie updated locally. Changes will sync when connection is restored.')
      }

      // Close edit mode
      cancelEdit()

      // Add this line to refresh the movie list
      await refreshList()
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update movie. Please try again.')
    }
  }
}

// Delete a movie
const deleteMovie = async (movie) => {
  if (confirm('Are you sure you want to delete this movie?')) {
    try {
      // Call the API to delete the movie
      await moviesStore.deleteMovieAPI(movie.id)

      // Update pending operations count
      await refreshPendingOperationsCount()

      // Different message based on connection status
      if (connectionStore.isOnline && connectionStore.isServerAvailable) {
        alert('Movie deleted successfully!')
      } else {
        alert('Movie deleted locally. Changes will sync when connection is restored.')
      }

      // Add this line to refresh the movie list
      await refreshList()
    } catch (error) {
      console.error('Delete error details:', error)
      alert('Failed to delete movie. Please try again.')
    }
  }
}

// Add a new movie
const addMovie = async () => {
  if (validateMovie(newMovie.value)) {
    try {
      if (newMovieTrailerFile.value) {
        // Handle with trailer upload
        const formData = new FormData()
        formData.append('title', newMovie.value.title)
        formData.append('director', newMovie.value.director)
        formData.append('releaseDate', newMovie.value.releaseDate)
        formData.append('rating', newMovie.value.rating)
        formData.append('description', newMovie.value.description)
        formData.append('poster', newMovie.value.poster)
        formData.append('trailer', newMovieTrailerFile.value)

        await moviesStore.addMovieWithTrailer(formData)
      } else {
        // Convert rating to number before saving
        const movieToAdd = {
          ...newMovie.value,
          rating: parseFloat(newMovie.value.rating),
        }
        await moviesStore.addMovieAPI(movieToAdd)
      }

      // Update pending operations count
      await refreshPendingOperationsCount()

      // Different message based on connection status
      if (connectionStore.isOnline && connectionStore.isServerAvailable) {
        alert('Movie added successfully!')
      } else {
        alert('Movie added locally. Changes will sync when connection is restored.')
      }

      // Clear form and hide it
      toggleAddMovieForm()

      // Add this line to refresh the movie list
      await refreshList()
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

// Add this function to the script section, after the handleLogout function

// Toggle add movie form visibility
const toggleAddMovieForm = () => {
  // Toggle the form visibility
  showAddMovieForm.value = !showAddMovieForm.value

  // Reset form if closing
  if (!showAddMovieForm.value) {
    newMovie.value = {
      title: '',
      director: '',
      releaseDate: '',
      rating: '',
      description: '',
      poster: '',
    }
    newMovieTrailerFile.value = null
    newMovieTrailerPreview.value = null
    errors.value = {}
  }
}
</script>

<!-- html -->
<template>
  <div class="min-h-screen bg-slate-900 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-red-600">Admin Dashboard</h1>
        <div class="flex items-center gap-4">
          <!-- Add this new sync button with pending operations count -->
          <button
            v-if="pendingOperationsCount > 0"
            @click="syncPendingChanges"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
            :disabled="!connectionStore.isOnline || !connectionStore.isServerAvailable"
          >
            <span class="mr-2">Sync Changes</span>
            <span class="bg-white text-blue-600 rounded-full px-2 py-0.5 text-sm font-bold">
              {{ pendingOperationsCount }}
            </span>
          </button>
          <button
            v-if="pendingOperationsCount > 0"
            @click="clearPendingChanges"
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors ml-2"
          >
            Clear Changes
          </button>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- Add connection status warning when offline -->
      <div
        v-if="!connectionStore.isOnline || !connectionStore.isServerAvailable"
        class="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700"
      >
        <p class="font-bold">Working in offline mode</p>
        <p>Changes will be saved locally and synchronized when connection is restored.</p>
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

            <!-- Add trailer field -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-300"
                >Trailer Video (Optional, max 1GB)</label
              >
              <input
                type="file"
                accept="video/*"
                @change="handleNewTrailerUpload"
                class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-green-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-600 file:text-white"
              />
              <p class="text-gray-400 text-xs mt-1">Supported formats: MP4, WebM, MOV</p>

              <!-- Preview trailer -->
              <div v-if="newMovieTrailerPreview" class="mt-3">
                <p class="text-sm font-medium text-gray-300 mb-1">Trailer Preview:</p>
                <video controls class="w-full rounded" :src="newMovieTrailerPreview"></video>
              </div>
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
          <div v-for="movie in displayedMovies" :key="movie.id" class="bg-slate-700 p-4 rounded-lg">
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
                  <p class="text-gray-300">Description: {{ movie.description }}</p>

                  <!-- Show trailer if available -->
                  <div v-if="movie.trailer" class="mt-4">
                    <p class="text-gray-300 mb-2">Trailer:</p>
                    <video
                      controls
                      class="w-full max-w-md rounded"
                      :src="`${API_BASE_URL}${movie.trailer}`"
                    ></video>
                  </div>
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

                <!-- Add trailer field to edit form -->
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-300"
                    >Trailer Video (Optional, max 1GB)</label
                  >
                  <input
                    type="file"
                    accept="video/*"
                    @change="handleEditTrailerUpload"
                    class="mt-1 block w-full px-3 py-2 bg-slate-600 border border-red-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-600 file:text-white"
                  />
                  <p class="text-gray-400 text-xs mt-1">Leave empty to keep existing trailer</p>

                  <!-- Preview existing or new trailer -->
                  <div v-if="trailerPreview" class="mt-3">
                    <p class="text-sm font-medium text-gray-300 mb-1">Trailer Preview:</p>
                    <video controls class="w-full rounded" :src="trailerPreview"></video>
                  </div>
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

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center py-4">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"
          ></div>
          <p class="mt-2 text-red-600">Loading more movies...</p>
        </div>

        <!-- End of list message -->
        <div
          v-if="noMoreMovies && displayedMovies.length > 0"
          class="text-center py-4 text-gray-400"
        >
          End of movie list
        </div>
      </div>
    </div>
  </div>
</template>
