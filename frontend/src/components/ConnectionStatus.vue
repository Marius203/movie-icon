<template>
  <div class="fixed top-4 right-4 z-50">
    <div
      v-if="!isOnline"
      class="flex items-center justify-center px-3 py-1.5 rounded-full bg-yellow-300 text-yellow-800 text-sm shadow-sm font-bold"
    >
      <i class="fas fa-wifi-off text-xs"></i>
      <span>Offline</span>
    </div>
    <div
      v-else-if="!isServerAvailable"
      class="flex items-center justify-center px-3 py-1.5 rounded-full bg-red-300 text-red-800 text-sm shadow-sm font-bold"
    >
      <i class="fas fa-server text-xs"></i>
      <span>Server Down</span>
    </div>
    <div
      v-else
      class="flex items-center justify-center px-3 py-1.5 rounded-full bg-green-300 text-green-800 text-sm shadow-sm font-bold"
    >
      <i class="fas fa-wifi text-xs"></i>
      <span>Online</span>
    </div>
  </div>
</template>

<script setup>
import { useConnectionStore } from '@/stores/connection'
import { storeToRefs } from 'pinia'

const connectionStore = useConnectionStore()
const { isOnline, isServerAvailable } = storeToRefs(connectionStore)
</script>

<style scoped>
/* No scoped styles needed as we're using Tailwind */
</style>
