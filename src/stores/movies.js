import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMoviesStore = defineStore('movies', () => {
  // Movie data
  const movies = ref([
    {
      title: 'Interstellar',
      director: 'Christopher Nolan',
      releaseDate: '2014-11-07',
      rating: 8.6,
      description:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      poster:
        'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    },
    {
      title: 'Inception',
      director: 'Christopher Nolan',
      releaseDate: '2010-07-16',
      rating: 8.8,
      description:
        'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      poster:
        'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
    },
    {
      title: 'The Shawshank Redemption',
      director: 'Frank Darabont',
      releaseDate: '1994-09-23',
      rating: 9.3,
      description:
        'Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.',
      poster:
        'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg',
    },
    {
      title: 'Parasite',
      director: 'Bong Joon-ho',
      releaseDate: '2019-05-30',
      rating: 8.5,
      description:
        'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      poster:
        'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg',
    },
    {
      title: 'The Godfather',
      director: 'Francis Ford Coppola',
      releaseDate: '1972-03-24',
      rating: 9.2,
      description:
        'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      poster:
        'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    },
    {
      title: 'The Dark Knight',
      director: 'Christopher Nolan',
      releaseDate: '2008-07-18',
      rating: 9.0,
      description:
        'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      poster:
        'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
    },
    //   {
    //     "title": "Pulp Fiction",
    //     "director": "Quentin Tarantino",
    //     "releaseDate": "1994-10-14",
    //     "rating": 8.9,
    //     "description": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    //     "poster": "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg"
    //   }
  ])

  // Current sort option
  const sortOption = ref('default')

  // Movies per page option
  const moviesPerPage = ref(5)

  // Set movies per page
  function setMoviesPerPage(value) {
    moviesPerPage.value = value
  }

  // Computed property for movie classification
  const getMovieClassification = (releaseDate) => {
    const year = new Date(releaseDate).getFullYear()
    if (year < 1980) return '👴' // Old man emoji for oldies
    if (year <= 2010) return '👨' // Man emoji for iconic
    return '👶' // Baby emoji for new gens
  }

  // Computed property for sorted movies
  const sortedMovies = computed(() => {
    // Create a copy of the array to avoid modifying the original
    const sortedArray = [...movies.value]

    switch (sortOption.value) {
      case 'titleAsc':
        return sortedArray.sort((a, b) => a.title.localeCompare(b.title))
      case 'titleDesc':
        return sortedArray.sort((a, b) => b.title.localeCompare(a.title))
      case 'ratingAsc':
        return sortedArray.sort((a, b) => a.rating - b.rating)
      case 'ratingDesc':
        return sortedArray.sort((a, b) => b.rating - a.rating)
      case 'classification':
        return sortedArray.sort((a, b) => {
          const classA = getMovieClassification(a.releaseDate)
          const classB = getMovieClassification(b.releaseDate)
          // Define the order of classifications
          const order = { '👴': 0, '👨': 1, '👶': 2 }
          return order[classA] - order[classB]
        })
      default:
        return sortedArray
    }
  })

  // Set sort option
  function setSortOption(option) {
    sortOption.value = option
  }

  // Add new movie
  function addMovie(movie) {
    movies.value.push(movie)
  }

  // Remove movie
  function removeMovie(index) {
    const movieToRemove = sortedMovies.value[index]
    const originalIndex = movies.value.findIndex(
      (m) => m.title === movieToRemove.title && m.director === movieToRemove.director,
    )

    if (originalIndex !== -1) {
      movies.value.splice(originalIndex, 1)
    }
  }

  // Update movie rating
  function updateMovieRating(index, rating) {
    const movieToUpdate = sortedMovies.value[index]
    const originalIndex = movies.value.findIndex(
      (m) => m.title === movieToUpdate.title && m.director === movieToUpdate.director,
    )

    if (originalIndex !== -1) {
      movies.value[originalIndex].rating = rating
    }
  }

  return {
    movies,
    sortedMovies,
    sortOption,
    setSortOption,
    addMovie,
    removeMovie,
    updateMovieRating,
    getMovieClassification,
    moviesPerPage,
    setMoviesPerPage,
  }
})