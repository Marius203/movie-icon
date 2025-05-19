import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

export const useAdminStore = defineStore('admin', () => {
  // Admin authentication state
  const isAdmin = ref(false)
  const adminUsername = ref('')
  const adminToken = ref('')

  // Login function that checks if the credentials are for admin or regular user
  async function login(username, password) {
    try {
      // Use the backend login endpoint
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password,
      })

      // Check if the user is an admin
      if (response.data.user && response.data.user.isAdmin) {
        isAdmin.value = true
        adminUsername.value = response.data.user.username
        adminToken.value = response.data.token

        // Store admin info in localStorage
        localStorage.setItem('adminLoggedIn', 'true')
        localStorage.setItem('adminToken', adminToken.value)
        localStorage.setItem('adminUsername', response.data.user.username)

        return { success: true, isAdmin: true }
      }

      // If not admin, return false to let the user store handle regular user login
      return { success: false, isAdmin: false }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false, isAdmin: false, error: 'Login failed' }
    }
  }

  // Logout function
  function logout() {
    isAdmin.value = false
    adminUsername.value = ''
    adminToken.value = ''

    // Clear admin data from localStorage
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')
  }

  // Check if admin is logged in
  function checkAdminStatus() {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    const storedToken = localStorage.getItem('adminToken')
    const storedUsername = localStorage.getItem('adminUsername')

    if (adminLoggedIn && storedToken && storedUsername) {
      isAdmin.value = true
      adminUsername.value = storedUsername
      adminToken.value = storedToken
    }
  }

  // Get admin token for API requests
  function getAdminToken() {
    return adminToken.value || localStorage.getItem('adminToken')
  }

  return {
    isAdmin,
    adminUsername,
    adminToken,
    login,
    logout,
    checkAdminStatus,
    getAdminToken,
  }
})
