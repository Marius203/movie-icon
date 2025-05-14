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
        
        // Fetch user's movies after login
        await fetchUserMovies()
        
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
    userMovies.value = [] // Clear user movies
    localStorage.removeItem('userToken')
    localStorage.removeItem('userLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
  }

  // Check login status
  async function checkLoginStatus() {
    console.log('Checking login status')
    const userToken = localStorage.getItem('userToken')
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true'
    const storedUsername = localStorage.getItem('username')
    const storedUserId = localStorage.getItem('userId')
    
    if (userToken && userLoggedIn && storedUsername) {
      token.value = userToken
      isLoggedIn.value = true
      currentUsername.value = storedUsername
      userId.value = storedUserId
      
      // Fetch user's movies if logged in
      console.log('User is logged in, fetching user movies')
      await fetchUserMovies()
      console.log(`Loaded ${userMovies.value.length} movies for user`)
    } else {
      console.log('User is not logged in')
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

  // Fetch user's movies from the server
  async function fetchUserMovies() {
    if (!isLoggedIn.value || !token.value) {
      console.log('Cannot fetch user movies: User not logged in')
      return
    }
    
    try {
      console.log('Fetching user movies from server')
      const response = await axios.get(`${API_URL}/user/movies`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      // Update the user's movies in the store
      userMovies.value = response.data
      console.log(`Fetched ${userMovies.value.length} movies for user`)
    } catch (error) {
      console.error('Error fetching user movies:', error)
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
  async function addMovie(movie) {
    if (!isLoggedIn.value || !token.value) {
      console.error('Cannot add movie: User not logged in')
      return false
    }
    
    try {
      console.log('Adding movie to user list:', movie)
      
      // Add movie to the database
      const response = await axios.post(
        `${API_URL}/user/movies`,
        {
          movieId: movie.id || null,
          rating: movie.rating || null,
          movie: movie.id ? null : {
            title: movie.title,
            director: movie.director,
            releaseDate: movie.releaseDate,
            rating: movie.rating,
            description: movie.description,
            poster: movie.poster,
            trailer: movie.trailer
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        }
      )
      
      console.log('Movie added successfully, refreshing user movies')
      
      // Refresh user's movies from the server instead of directly pushing to local state
      await fetchUserMovies()
      
      return true
    } catch (error) {
      console.error('Error adding movie to user list:', error)
      
      // If the error is that the movie is already in the list, refresh the user's movies
      if (error.response && error.response.status === 400 && 
          error.response.data.message === 'Movie already in your list') {
        console.log('Movie already in user list, refreshing user movies')
        await fetchUserMovies()
        return true
      }
      
      return false
    }
  }

  // Remove movie from the user's list
  async function removeMovie(index) {
    if (!isLoggedIn.value || !token.value) {
      console.error('Cannot remove movie: User not logged in')
      return false
    }
    
    // Use the sorted index directly since we are operating on the user's potentially sorted list
    if (index >= 0 && index < sortedMovies.value.length) {
      const movieToRemove = sortedMovies.value[index]
      
      try {
        // Remove from the database
        await axios.delete(
          `${API_URL}/user/movies/${movieToRemove.id}`,
          {
            headers: {
              Authorization: `Bearer ${token.value}`
            }
          }
        )
        
        // Remove from local state
        const originalIndex = userMovies.value.findIndex(
          (m) => m.id === movieToRemove.id
        )
        
        if (originalIndex !== -1) {
          userMovies.value.splice(originalIndex, 1)
        }
        
        return true
      } catch (error) {
        console.error('Error removing movie from user list:', error)
        return false
      }
    } else {
      console.error('Error removing movie: Invalid index', index)
      return false
    }
  }

  // Update movie rating in the user's list
  async function updateMovieRating(index, rating) {
    if (!isLoggedIn.value || !token.value) {
      console.error('Cannot update rating: User not logged in')
      return false
    }
    
    // Use the sorted index directly
    if (index >= 0 && index < sortedMovies.value.length) {
      const movieToUpdate = sortedMovies.value[index]
      
      try {
        // Update in the database
        await axios.put(
          `${API_URL}/user/movies/${movieToUpdate.id}`,
          { rating },
          {
            headers: {
              Authorization: `Bearer ${token.value}`
            }
          }
        )
        
        // Update in local state
        const originalIndex = userMovies.value.findIndex(
          (m) => m.id === movieToUpdate.id
        )
        
        if (originalIndex !== -1) {
          userMovies.value[originalIndex].rating = rating
        }
        
        return true
      } catch (error) {
        console.error('Error updating movie rating:', error)
        return false
      }
    } else {
      console.error('Error updating rating: Invalid index', index)
      return false
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
    fetchUserMovies,
    token,
    userId
  }
})
