import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  // Admin authentication state
  const isAdmin = ref(false)
  const adminUsername = ref('')

  // Admin credentials (in a real app, this would be handled server-side)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123', // In a real app, this would be hashed and stored securely
  }

  // Login function that checks if the credentials are for admin or regular user
  function login(username, password) {
    // Check if it's an admin login
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      isAdmin.value = true
      adminUsername.value = username
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('userLoggedIn', 'true') // Also set user login for shared functionality
      return { success: true, isAdmin: true }
    }

    // If not admin, return false to let the user store handle regular user login
    return { success: false, isAdmin: false }
  }

  // Logout function
  function logout() {
    isAdmin.value = false
    adminUsername.value = ''
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('userLoggedIn')
  }

  // Check if admin is logged in
  function checkAdminStatus() {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    if (adminLoggedIn) {
      isAdmin.value = true
      adminUsername.value = ADMIN_CREDENTIALS.username
    }
  }

  return {
    isAdmin,
    adminUsername,
    login,
    logout,
    checkAdminStatus,
  }
})
