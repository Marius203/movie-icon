<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useMoviesStore } from '@/stores/movies'

ChartJS.register(ArcElement, Tooltip, Legend)

const moviesStore = useMoviesStore()

const chartData = computed(() => {
  const movies = moviesStore.movies
  const oldies = movies.filter(movie => moviesStore.getMovieClassification(movie.releaseDate) === '👴').length
  const iconic = movies.filter(movie => moviesStore.getMovieClassification(movie.releaseDate) === '👨').length
  const newGen = movies.filter(movie => moviesStore.getMovieClassification(movie.releaseDate) === '👶').length

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
  <div class="chart-container">
    <h3>Movie Distribution</h3>
    <div class="chart-wrapper">
      <Pie :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  background-color: #2a2f4c;
  border: 2px solid #d4af37;
  border-radius: 8px;
  padding: 10px;
  position: fixed;
  right: 20px;
  top: 100px;
  width: 200px;
  height: 250px;
  z-index: 100;
}

.chart-wrapper {
  height: 200px;
  width: 100%;
}

h3 {
  color: #d4af37;
  text-align: center;
  margin-bottom: 10px;
  font-family: 'Open Sans', sans-serif;
  font-weight: 700;
  font-size: 0.9em;
}
</style> 