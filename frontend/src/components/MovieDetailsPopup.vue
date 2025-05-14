<!-- javascript -->
<script setup>
import { computed } from 'vue'
import { useUsersStore } from '@/stores/users'
import { API_BASE_URL } from '@/config/api'

const props = defineProps({
  movie: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'steal'])

const userMoviesStore = useUsersStore()

// Function to check if a movie is in the user's list
const isMovieInUserList = (movie) => {
  return userMoviesStore.userMovies.some(
    (m) =>
      m.title === movie.title &&
      m.director === movie.director &&
      m.releaseDate === movie.releaseDate
  )
}

// Check if movie exists in user's database
const isMovieInUserListComputed = computed(() => {
  return isMovieInUserList(props.movie)
})

// Format release date
const formattedReleaseDate = computed(() => {
  return new Date(props.movie.releaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// Get full trailer URL
const trailerUrl = computed(() => {
  return props.movie.trailer ? `${API_BASE_URL}${props.movie.trailer}` : null
})

// Handle steal button click
const handleSteal = () => {
  if (!isMovieInUserListComputed.value) {
    emit('steal', props.movie)
  }
}

// Handle download trailer
const downloadTrailer = () => {
  if (trailerUrl.value) {
    window.open(trailerUrl.value, '_blank')
  }
}
</script>

<!-- html -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-slate-800 rounded-lg p-6 max-w-2xl w-11/12 max-h-[90vh] overflow-y-auto">
      <!-- Header with title and close button -->
      <div class="flex justify-between items-center mb-4 border-b border-yellow-600 pb-2">
        <h2 class="text-2xl font-bold text-yellow-600">{{ movie.title }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Movie content -->
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Left column with poster -->
        <div class="w-full md:w-1/3">
          <img
            :src="movie.poster"
            :alt="movie.title"
            class="w-full rounded-lg shadow-lg border-2 border-yellow-600"
          />
        </div>

        <!-- Right column with details -->
        <div class="w-full md:w-2/3">
          <div class="space-y-4">
            <div>
              <h3 class="text-yellow-600 font-semibold">Rating</h3>
              <p class="text-white text-xl">★ {{ movie.rating }}/10</p>
            </div>

            <div>
              <h3 class="text-yellow-600 font-semibold">Director</h3>
              <p class="text-white">{{ movie.director }}</p>
            </div>

            <div>
              <h3 class="text-yellow-600 font-semibold">Release Date</h3>
              <p class="text-white">{{ formattedReleaseDate }}</p>
            </div>

            <div>
              <h3 class="text-yellow-600 font-semibold">Description</h3>
              <p class="text-white">{{ movie.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Trailer Section -->
      <div v-if="movie.trailer" class="mt-8 border-t border-yellow-600 pt-6">
        <h3 class="text-yellow-600 font-semibold text-center mb-4">Trailer</h3>
        <div class="max-w-2xl mx-auto">
          <video
            controls
            class="w-full rounded-lg border-2 border-yellow-600"
            :src="trailerUrl"
          ></video>
          <button
            @click="downloadTrailer"
            class="mt-4 mx-auto px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Trailer
          </button>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex justify-end gap-4 mt-6 pt-4 border-t border-yellow-600">
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Done
        </button>
        <button
          @click="handleSteal"
          :disabled="isMovieInUserListComputed"
          class="px-4 py-2 rounded transition-colors"
          :class="
            isMovieInUserListComputed
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          "
        >
          {{ isMovieInUserListComputed ? 'Already Stolen' : 'Steal this' }}
        </button>
      </div>
    </div>
  </div>
</template>
