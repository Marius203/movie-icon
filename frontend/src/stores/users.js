import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUsersStore = defineStore('users', () => {
  // User authentication state
  const isLoggedIn = ref(false)
  const currentUsername = ref('')
  const token = ref('')
  const userId = ref(null)

  // User-specific movie data - starts empty
  const userMovies = ref([])

  // Current sort option for the user's list
  const sortOption = ref('default')

  // Movies per page option for the user's list
  const moviesPerPage = ref(5)

  // API base URL
  const API_URL = 'http://localhost:3000'

  // Login function
  async function login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      })

      if (response.data.token) {
        // Store token and user info
        token.value = response.data.token
        currentUsername.value = response.data.user.username
        userId.value = response.data.user.id
        isLoggedIn.value = true
        
        // Store in localStorage for persistence
        localStorage.setItem('userToken', response.data.token)
        localStorage.setItem('userLoggedIn', 'true')
        localStorage.setItem('username', response.data.user.username)
        localStorage.setItem('userId', response.data.user.id)
        
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // Register function
  async function register({ username, email, password }) {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password
      })
      
      return { success: true, message: response.data.message }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      }
    }
  }

  // Logout function
  function logout() {
    isLoggedIn.value = false
    currentUsername.value = ''
    token.value = ''
    userId.value = null
    localStorage.removeItem('userToken')
    localStorage.removeItem('userLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
  }

  // Check login status
  function checkLoginStatus() {
    const userToken = localStorage.getItem('userToken')
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true'
    const storedUsername = localStorage.getItem('username')
    const storedUserId = localStorage.getItem('userId')
    
    if (userToken && userLoggedIn && storedUsername) {
      token.value = userToken
      isLoggedIn.value = true
      currentUsername.value = storedUsername
      userId.value = storedUserId
    }
  }

  // Get user profile
  async function getUserProfile() {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Set movies per page for the user's list
  function setMoviesPerPage(value) {
    moviesPerPage.value = value
  }

  // Computed property for movie classification (can be shared logic)
  const getMovieClassification = (releaseDate) => {
    const year = new Date(releaseDate).getFullYear()
    if (year < 1980) return '👴'
    if (year <= 2010) return '👨'
    return '👶'
  }

  // Computed property for sorted user movies
  const sortedMovies = computed(() => {
    const sortedArray = [...userMovies.value]

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
          const order = { '👴': 0, '👨': 1, '👶': 2 }
          return order[classA] - order[classB]
        })
      default:
        return sortedArray
    }
  })

  // Set sort option for the user's list
  function setSortOption(option) {
    sortOption.value = option
  }

  // Add new movie to the user's list
  function addMovie(movie) {
    // Optional: Add check to prevent duplicates if needed
    userMovies.value.push(movie)
  }

  // Remove movie from the user's list
  function removeMovie(index) {
    // Use the sorted index directly since we are operating on the user's potentially sorted list
    if (index >= 0 && index < sortedMovies.value.length) {
      const movieToRemove = sortedMovies.value[index]
      const originalIndex = userMovies.value.findIndex(
        (m) =>
          m.title === movieToRemove.title &&
          m.director === movieToRemove.director &&
          m.releaseDate === movieToRemove.releaseDate,
      )
      if (originalIndex !== -1) {
        userMovies.value.splice(originalIndex, 1)
      }
    } else {
      console.error('Error removing movie: Invalid index', index)
    }
  }

  // Update movie rating in the user's list
  function updateMovieRating(index, rating) {
    // Use the sorted index directly
    if (index >= 0 && index < sortedMovies.value.length) {
      const movieToUpdate = sortedMovies.value[index]
      const originalIndex = userMovies.value.findIndex(
        (m) =>
          m.title === movieToUpdate.title &&
          m.director === movieToUpdate.director &&
          m.releaseDate === movieToUpdate.releaseDate,
      )
      if (originalIndex !== -1) {
        userMovies.value[originalIndex].rating = rating
      }
    } else {
      console.error('Error updating rating: Invalid index', index)
    }
  }

  return {
    isLoggedIn,
    currentUsername,
    userMovies,
    sortedMovies,
    sortOption,
    setSortOption,
    addMovie,
    removeMovie,
    updateMovieRating,
    getMovieClassification,
    moviesPerPage,
    setMoviesPerPage,
    login,
    logout,
    checkLoginStatus,
    register,
    getUserProfile,
    token,
    userId
  }
})
