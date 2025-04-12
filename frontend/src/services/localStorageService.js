import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

// In-memory cache
let moviesCache = []
let pendingOperations = []

// Storage keys
const STORAGE_KEYS = {
  MOVIES: 'movie-icon-movies',
  PENDING_OPERATIONS: 'movie-icon-pending-operations',
}

// Load data from localStorage
const loadCache = () => {
  try {
    // Load movies
    const storedMovies = localStorage.getItem(STORAGE_KEYS.MOVIES)
    if (storedMovies) {
      moviesCache = JSON.parse(storedMovies)
    }

    // Load pending operations
    const storedOperations = localStorage.getItem(STORAGE_KEYS.PENDING_OPERATIONS)
    if (storedOperations) {
      pendingOperations = JSON.parse(storedOperations)
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
}

// Save data to localStorage
const saveCache = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(moviesCache))
    localStorage.setItem(STORAGE_KEYS.PENDING_OPERATIONS, JSON.stringify(pendingOperations))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Initialize cache when service loads
loadCache()

export const localStorageService = {
  async getAllMovies() {
    return moviesCache
  },

  async getMovie(id) {
    return moviesCache.find((movie) => movie.id === id) || null
  },

  async addMovie(movie) {
    // Check if movie already exists (avoid duplicates)
    const existingIndex = moviesCache.findIndex((m) => m.id === movie.id)
    if (existingIndex !== -1) {
      moviesCache[existingIndex] = movie
    } else {
      moviesCache.push(movie)
    }
    saveCache()
    return movie
  },

  async updateMovie(movie) {
    const index = moviesCache.findIndex((m) => m.id === movie.id)
    if (index !== -1) {
      moviesCache[index] = movie
      saveCache()
      return movie
    }
    return null
  },

  async deleteMovie(id) {
    const index = moviesCache.findIndex((movie) => movie.id === id)
    if (index !== -1) {
      const deletedMovie = moviesCache[index]
      moviesCache.splice(index, 1)
      saveCache()
      return deletedMovie
    }
    return null
  },

  async queueOperation(operation) {
    const pendingOp = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      type: operation.type, // 'CREATE', 'UPDATE', 'DELETE'
      data: operation.data,
      timestamp: new Date().toISOString(),
      status: 'pending',
    }

    pendingOperations.push(pendingOp)
    saveCache()

    return pendingOp
  },

  async getPendingOperations() {
    return pendingOperations
  },

  async clearPendingOperations() {
    pendingOperations = []
    saveCache()
    return true
  },

  async getPendingOperationsByType() {
    const result = {
      CREATE: 0,
      UPDATE: 0,
      DELETE: 0,
      total: pendingOperations.length,
    }

    pendingOperations.forEach((op) => {
      if (op.type in result) {
        result[op.type]++
      }
    })

    return result
  },

  async syncPendingOperations() {
    const operationsToProcess = [...pendingOperations]
    const remainingOps = []

    for (const op of operationsToProcess) {
      try {
        switch (op.type) {
          case 'CREATE':
            await axios.post(`${API_BASE_URL}/movies`, op.data)
            break
          case 'UPDATE':
            await axios.put(`${API_BASE_URL}/movies/${op.data.id}`, op.data)
            break
          case 'DELETE':
            await axios.delete(`${API_BASE_URL}/movies/${op.data.id}`)
            break
        }
      } catch (error) {
        console.error('Failed to sync operation:', error)
        remainingOps.push(op) // Keep failed operations
      }
    }

    // Update the pending operations with only those that failed
    pendingOperations = remainingOps
    saveCache()

    return pendingOperations.length === 0 // true if all synced
  },
}
