<script setup>
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import LogoutButton from '@/components/LogoutButton.vue'
import NavigationBar from '@/components/NavigationBar.vue'
import { onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useAdminStore } from '@/stores/admin'

const usersStore = useUsersStore()
const adminStore = useAdminStore()

onMounted(async () => {
  console.log('App mounted, checking login status')
  // Check login status on app mount
  await usersStore.checkLoginStatus()
  
  // If user is logged in, fetch their movies
  if (usersStore.isLoggedIn) {
    console.log('User is logged in, fetching user movies')
    await usersStore.fetchUserMovies()
  }
  
  adminStore.checkAdminStatus()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-slate-900">
    <ConnectionStatus />
    <NavigationBar />
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
    <LogoutButton />
  </div>
</template>
