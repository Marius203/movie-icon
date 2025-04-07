import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useMoviesStore = defineStore('movies', () => {
  // Movie data
  var movies = ref([])

  // Helper function for delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  // Add this new action
  async function fetchMovies(limit = 20, offset = 0, delayMs = 500) {
    try {
      // Include limit and offset as query parameters
      const response = await axios.get(
        `http://localhost:3000/movies?limit=${limit}&offset=${offset}`,
      )
      movies.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching movies:', error)
      return []
    }
  }

  // Add this for sorting through API
  async function fetchMoviesWithSort(sortBy, order, limit = 20, offset = 0) {
    try {
      const response = await axios.get(
        `http://localhost:3000/movies?sort=${sortBy}&order=${order}&limit=${limit}&offset=${offset}`,
      )
      movies.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching sorted movies:', error)
      return []
    }
  }

  // Add this for filtering
  async function fetchMoviesByDirector(director) {
    try {
      const response = await axios.get(`http://localhost:3000/movies?director=${director}`)
      movies.value = response.data
    } catch (error) {
      console.error('Error fetching movies by director:', error)
    }
  }

  // Add a new movie via API
  async function addMovieAPI(movie) {
    try {
      const response = await axios.post('http://localhost:3000/movies', movie)
      // Add the newly created movie to local state
      movies.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('Error adding movie:', error)
      throw error
    }
  }

  // Delete a movie via API
  async function deleteMovieAPI(movieId) {
    try {
      // Make the delete request to the API
      await axios.delete(`http://localhost:3000/movies/${movieId}`)

      // Remove the movie from local state
      const index = movies.value.findIndex((movie) => movie.id === movieId)
      if (index !== -1) {
        movies.value.splice(index, 1)
      }

      return true
    } catch (error) {
      console.error('Error deleting movie:', error)
      throw error
    }
  }

  async function updateMovieAPI(movieId, updatedMovie) {
    try {
      const response = await axios.put(`http://localhost:3000/movies/${movieId}`, updatedMovie)

      // Update the movie in local state
      const index = movies.value.findIndex((movie) => movie.id === movieId)
      if (index !== -1) {
        movies.value[index] = response.data
      }

      return response.data
    } catch (error) {
      console.error('Error updating movie:', error)
      throw error
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
    // Add these methods to expose them
    fetchMovies,
    fetchMoviesWithSort,
    fetchMoviesByDirector,
    addMovieAPI,
    deleteMovieAPI,
    updateMovieAPI,
  }
})
