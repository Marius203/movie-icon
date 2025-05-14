<script setup>
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import LogoutButton from '@/components/LogoutButton.vue'
import { onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useAdminStore } from '@/stores/admin'

const usersStore = useUsersStore()
const adminStore = useAdminStore()

onMounted(() => {
  // Check login status on app mount
  usersStore.checkLoginStatus()
  adminStore.checkAdminStatus()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-slate-900">
    <ConnectionStatus />
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
    <LogoutButton />
  </div>
</template>
