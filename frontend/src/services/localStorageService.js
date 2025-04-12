import { openDB } from 'idb'
import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

const DB_NAME = 'movieAppDB'
const DB_VERSION = 1
const STORE_NAMES = {
  MOVIES: 'movies',
  PENDING_OPERATIONS: 'pendingOperations',
}

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    db.createObjectStore(STORE_NAMES.MOVIES, { keyPath: 'id' })
    db.createObjectStore(STORE_NAMES.PENDING_OPERATIONS, { autoIncrement: true })
  },
})

export const localStorageService = {
  async getAllMovies() {
    return (await dbPromise).getAll(STORE_NAMES.MOVIES)
  },

  async getMovie(id) {
    return (await dbPromise).get(STORE_NAMES.MOVIES, id)
  },

  async addMovie(movie) {
    return (await dbPromise).add(STORE_NAMES.MOVIES, movie)
  },

  async updateMovie(movie) {
    return (await dbPromise).put(STORE_NAMES.MOVIES, movie)
  },

  async deleteMovie(id) {
    return (await dbPromise).delete(STORE_NAMES.MOVIES, id)
  },

  async queueOperation(operation) {
    const pendingOp = {
      type: operation.type, // 'CREATE', 'UPDATE', 'DELETE'
      data: operation.data,
      timestamp: new Date().toISOString(),
      status: 'pending',
    }
    return (await dbPromise).add(STORE_NAMES.PENDING_OPERATIONS, pendingOp)
  },

  async getPendingOperations() {
    return (await dbPromise).getAll(STORE_NAMES.PENDING_OPERATIONS)
  },

  async clearPendingOperations() {
    return (await dbPromise).clear(STORE_NAMES.PENDING_OPERATIONS)
  },

  async syncPendingOperations() {
    const db = await dbPromise
    const pendingOps = await db.getAll(STORE_NAMES.PENDING_OPERATIONS)

    for (const op of pendingOps) {
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
        // Remove successful operation
        await db.delete(STORE_NAMES.PENDING_OPERATIONS, op.id)
      } catch (error) {
        console.error('Failed to sync operation:', error)
      }
    }
  },
}
