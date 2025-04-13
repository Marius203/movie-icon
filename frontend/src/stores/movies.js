import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { localStorageService } from '@/services/localStorageService'
import { useConnectionStore } from '@/stores/connection'
import { API_BASE_URL } from '@/config/api'

export const useMoviesStore = defineStore('movies', () => {
  const connectionStore = useConnectionStore()
  // Movie data
  var movies = ref([])

  // Helper function for delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  // Add this new action
  async function fetchMovies(limit = 20, offset = 0, delayMs = 500) {
    try {
      if (connectionStore.isOnline && connectionStore.isServerAvailable) {
        const response = await axios.get(`${API_BASE_URL}/movies?limit=${limit}&offset=${offset}`)
        movies.value = response.data
        // Cache the movies locally
        await Promise.all(response.data.map((movie) => localStorageService.addMovie(movie)))
        return response.data
      } else {
        // Offline mode: get from local storage
        const localMovies = await localStorageService.getAllMovies()
        movies.value = localMovies
        return localMovies
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
      return []
    }
  }

  // Add this for sorting through API
  async function fetchMoviesWithSort(sortBy, order, limit = 20, offset = 0) {
    try {
      if (connectionStore.isOnline && connectionStore.isServerAvailable) {
        const response = await axios.get(
          `${API_BASE_URL}/movies?sort=${sortBy}&order=${order}&limit=${limit}&offset=${offset}`,
        )
        movies.value = response.data
        return response.data
      } else {
        // Offline mode: sort locally
        const localMovies = await localStorageService.getAllMovies()
        const sortedMovies = [...localMovies].sort((a, b) => {
          if (sortBy === 'title') {
            return order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
          } else if (sortBy === 'rating') {
            return order === 'asc' ? a.rating - b.rating : b.rating - a.rating
          }
          return 0
        })
        movies.value = sortedMovies
        return sortedMovies
      }
    } catch (error) {
      console.error('Error fetching sorted movies:', error)
      return []
    }
  }

  // Add this for filtering
  async function fetchMoviesByDirector(director) {
    try {
      if (connectionStore.isOnline && connectionStore.isServerAvailable) {
        const response = await axios.get(`${API_BASE_URL}/movies?director=${director}`)
        movies.value = response.data
      } else {
        // Offline mode: filter locally
        const localMovies = await localStorageService.getAllMovies()
        movies.value = localMovies.filter((movie) =>
          movie.director.toLowerCase().includes(director.toLowerCase()),
        )
      }
    } catch (error) {
      console.error('Error fetching movies by director:', error)
    }
  }

  // Add a new movie via API
  async function addMovieAPI(movie) {
    try {
      if (connectionStore.isOnline && connectionStore.isServerAvailable) {
        const response = await axios.post(`${API_BASE_URL}/movies`, movie)
        // Add the newly created movie to local state
        movies.value.push(response.data)
        // Cache locally
        await localStorageService.addMovie(response.data)
        return response.data
      } else {
        // Offline mode: store locally and queue for sync
        const localMovie = { ...movie, id: Date.now(), isOffline: true }
        await localStorageService.addMovie(localMovie)
        await localStorageService.queueOperation({
          type: 'CREATE',
          data: movie,
        })
        movies.value.push(localMovie)
        return localMovie
      }
    } catch (error) {
      console.error('Error adding movie:', error)
      throw error
    }
  }

  // Add a new movie with trailer via API
  async function addMovieWithTrailer(formData) {
    try {
      if (connectionStore.isOnline && connectionStore.isServerAvailable) {
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
        const response = await axios.post(`${API_BASE_URL}/movies`, formData, config)
        // Add the newly created movie to local state
        movies.value.push(response.data)
        // Cache locally
        await localStorageService.addMovie(response.data)
        return response.data
      } else {
        // For offline mode, we can't really handle file uploads
        // So we'll just add the basic movie info without the trailer
        const basicMovieData = {}
        formData.forEach((value, key) => {
          if (key !== 'trailer') basicMovieData[key] = value
        })

        const localMovie = { ...basicMovieData, id: Date.now(), isOffline: true }
        await localStorageService.addMovie(localMovie)
        await localStorageService.queueOperation({
          type: 'CREATE',
          data: basicMovieData,
        })
        movies.value.push(localMovie)
        return localMovie
      }
    } catch (error) {
      console.error('Error adding movie with trailer:', error)
      throw error
    }
  }

  // Delete a movie via API
  async function deleteMovieAPI(movieId) {
    try {
      if (connectionStore.isOnline && connectionStore.isServerAvailable) {
        await axios.delete(`${API_BASE_URL}/movies/${movieId}`)
        // Remove from local state
        const index = movies.value.findIndex((movie) => movie.id === movieId)
        if (index !== -1) {
          movies.value.splice(index, 1)
        }
        // Remove from local storage
        await localStorageService.deleteMovie(movieId)
      } else {
        // Offline mode: mark for deletion and queue operation
        const movie = movies.value.find((m) => m.id === movieId)
        if (movie) {
          await localStorageService.queueOperation({
            type: 'DELETE',
            data: { id: movieId },
          })
          // Remove from local state
          const index = movies.value.findIndex((movie) => movie.id === movieId)
          if (index !== -1) {
            movies.value.splice(index, 1)
          }
          // Remove from local storage
          await localStorageService.deleteMovie(movieId)
        }
      }
      return true
    } catch (error) {
      console.error('Error deleting movie:', error)
      throw error
    }
  }

  async function updateMovieAPI(movieId, updatedMovie) {
    try {
      if (connectionStore.isOnline && connectionStore.isServerAvailable) {
        const response = await axios.put(`${API_BASE_URL}/movies/${movieId}`, updatedMovie)
        // Update in local state
        const index = movies.value.findIndex((movie) => movie.id === movieId)
        if (index !== -1) {
          movies.value[index] = response.data
        }
        // Update in local storage
        await localStorageService.updateMovie(response.data)
        return response.data
      } else {
        // Offline mode: update locally and queue operation
        const localMovie = { ...updatedMovie, id: movieId, isOffline: true }
        await localStorageService.updateMovie(localMovie)
        await localStorageService.queueOperation({
          type: 'UPDATE',
          data: updatedMovie,
        })
        // Update in local state
        const index = movies.value.findIndex((movie) => movie.id === movieId)
        if (index !== -1) {
          movies.value[index] = localMovie
        }
        return localMovie
      }
    } catch (error) {
      console.error('Error updating movie:', error)
      throw error
    }
  }

  // Update movie with trailer via API
  async function updateMovieWithTrailer(movieId, formData) {
    try {
      if (connectionStore.isOnline && connectionStore.isServerAvailable) {
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
        const response = await axios.put(`${API_BASE_URL}/movies/${movieId}`, formData, config)
        // Update in local state
        const index = movies.value.findIndex((movie) => movie.id === movieId)
        if (index !== -1) {
          movies.value[index] = response.data
        }
        // Update in local storage
        await localStorageService.updateMovie(response.data)
        return response.data
      } else {
        // For offline mode, we'll update without the trailer
        const basicMovieData = {}
        formData.forEach((value, key) => {
          if (key !== 'trailer') basicMovieData[key] = value
        })

        const localMovie = { ...basicMovieData, id: movieId, isOffline: true }
        await localStorageService.updateMovie(localMovie)
        await localStorageService.queueOperation({
          type: 'UPDATE',
          data: localMovie,
        })

        const index = movies.value.findIndex((movie) => movie.id === movieId)
        if (index !== -1) {
          movies.value[index] = localMovie
        }
        return localMovie
      }
    } catch (error) {
      console.error('Error updating movie with trailer:', error)
      throw error
    }
  }

  // Add sync method
  async function syncWithServer() {
    if (connectionStore.isOnline && connectionStore.isServerAvailable) {
      await localStorageService.syncPendingOperations()
      connectionStore.lastSyncTime = new Date()
    }
  }

  // Current sort option
  const sortOption = ref('default')

  // Movies per page option
  const moviesPerPage = ref(5)

  // Set movies per page
  function setMoviesPerPage(value) {
    moviesPerPage.value = value
  }

  // Computed property for movie classification
  const getMovieClassification = (releaseDate) => {
    const year = new Date(releaseDate).getFullYear()
    if (year < 1980) return '👴' // Old man emoji for oldies
    if (year <= 2010) return '👨' // Man emoji for iconic
    return '👶' // Baby emoji for new gens
  }

  // Computed property for sorted movies
  const sortedMovies = computed(() => {
    // Create a copy of the array to avoid modifying the original
    const sortedArray = [...movies.value]

    switch (sortOption.value) {
      case 'titleAsc':
        return sortedArray.sort((a, b) => a.title.localeCompare(b.title))
      case 'titleDesc':
        return sortedArray.sort((a, b) => b.title.localeCompare(a.title))
      case 'ratingAsc':
        return sortedArray.sort((a, b) => a.rating - b.rating)
      case 'ratingDesc':
        return sortedArray.sort((a, b) => b.rating - a.rating)
      case 'classification':
        return sortedArray.sort((a, b) => {
          const classA = getMovieClassification(a.releaseDate)
          const classB = getMovieClassification(b.releaseDate)
          // Define the order of classifications
          const order = { '👴': 0, '👨': 1, '👶': 2 }
          return order[classA] - order[classB]
        })
      default:
        return sortedArray
    }
  })

  // Set sort option
  function setSortOption(option) {
    sortOption.value = option
  }

  return {
    movies,
    sortedMovies,
    sortOption,
    setSortOption,
    getMovieClassification,
    moviesPerPage,
    setMoviesPerPage,
    fetchMovies,
    fetchMoviesWithSort,
    fetchMoviesByDirector,
    addMovieAPI,
    addMovieWithTrailer,
    deleteMovieAPI,
    updateMovieAPI,
    updateMovieWithTrailer,
    syncWithServer,
  }
})
