<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useMoviesStore } from '@/stores/movies'

ChartJS.register(ArcElement, Tooltip, Legend)

const moviesStore = useMoviesStore()

const chartData = computed(() => {
  const movies = moviesStore.movies
  const oldies = movies.filter(
    (movie) => moviesStore.getMovieClassification(movie.releaseDate) === '👴',
  ).length
  const iconic = movies.filter(
    (movie) => moviesStore.getMovieClassification(movie.releaseDate) === '👨',
  ).length
  const newGen = movies.filter(
    (movie) => moviesStore.getMovieClassification(movie.releaseDate) === '👶',
  ).length

  return {
    labels: ['Oldies 👴', 'Iconic 👨', 'New Gen 👶'],
    datasets: [
      {
        data: [oldies, iconic, newGen],
        backgroundColor: ['#d4af37', '#ff5733', '#3399ff'],
        borderColor: ['#1a1f3c', '#1a1f3c', '#1a1f3c'],
        borderWidth: 2,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#e6e6e6',
        font: {
          size: 12,
        },
        boxWidth: 12,
        padding: 8,
      },
    },
  },
}
</script>

<template>
  <div
    class="bg-slate-800 border-2 border-yellow-600 rounded-lg p-2.5 fixed right-5 top-[100px] w-[200px] h-[250px] z-50 hidden lg:block"
  >
    <h3 class="text-yellow-600 text-center mb-2.5 font-sans font-bold text-sm">
      Movie Distribution
    </h3>
    <div class="h-[200px] w-full">
      <Pie :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
/* Styles removed as they are replaced by Tailwind classes */
</style>
