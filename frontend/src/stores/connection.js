import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

export const useConnectionStore = defineStore('connection', () => {
  const isOnline = ref(navigator.onLine)
  const isServerAvailable = ref(true)
  const lastSyncTime = ref(null)

  // Health check interval
  const HEALTH_CHECK_INTERVAL = 10000 // 10 seconds

  // Update online status
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }

  // Check server availability
  const checkServerAvailability = async () => {
    try {
      await axios.get(`${API_BASE_URL}/health`)
      isServerAvailable.value = true
    } catch (error) {
      isServerAvailable.value = false
    }
  }

  // Setup listeners
  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    const healthCheckInterval = setInterval(checkServerAvailability, HEALTH_CHECK_INTERVAL)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      clearInterval(healthCheckInterval)
    }
  })

  return {
    isOnline,
    isServerAvailable,
    lastSyncTime,
    checkServerAvailability,
  }
})
