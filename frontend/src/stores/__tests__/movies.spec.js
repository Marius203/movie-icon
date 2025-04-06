import { setActivePinia, createPinia } from 'pinia'
import { useMoviesStore } from '../movies'

describe('Movies Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should initialize with default movies', () => {
      const store = useMoviesStore()
      expect(store.movies.length).toBe(7)
      expect(store.movies[0].title).toBe('Interstellar')
      expect(store.movies[0].director).toBe('Christopher Nolan')
    })

    it('should initialize with default sort option', () => {
      const store = useMoviesStore()
      expect(store.sortOption).toBe('default')
    })

    it('should initialize with default movies per page', () => {
      const store = useMoviesStore()
      expect(store.moviesPerPage).toBe(5)
    })
  })

  describe('Sorting', () => {
    it('should sort movies by title ascending', () => {
      const store = useMoviesStore()
      store.setSortOption('titleAsc')
      expect(store.sortedMovies[0].title).toBe('Inception')
    })

    it('should sort movies by title descending', () => {
      const store = useMoviesStore()
      store.setSortOption('titleDesc')
      expect(store.sortedMovies[0].title).toBe('The Shawshank Redemption')
    })

    it('should sort movies by rating ascending', () => {
      const store = useMoviesStore()
      store.setSortOption('ratingAsc')
      expect(store.sortedMovies[0].rating).toBe(8.5)
    })

    it('should sort movies by rating descending', () => {
      const store = useMoviesStore()
      store.setSortOption('ratingDesc')
      expect(store.sortedMovies[0].rating).toBe(9.3)
    })

    it('should sort movies by classification', () => {
      const store = useMoviesStore()
      store.setSortOption('classification')
      // First movie should be the oldest (👴)
      expect(new Date(store.sortedMovies[0].releaseDate).getFullYear()).toBeLessThan(1980)
    })
  })

  describe('Movie Classification', () => {
    it('should classify old movies correctly', () => {
      const store = useMoviesStore()
      expect(store.getMovieClassification('1972-03-24')).toBe('👴')
    })

    it('should classify iconic movies correctly', () => {
      const store = useMoviesStore()
      expect(store.getMovieClassification('2010-07-16')).toBe('👨')
    })

    it('should classify new movies correctly', () => {
      const store = useMoviesStore()
      expect(store.getMovieClassification('2019-05-30')).toBe('👶')
    })
  })

  describe('Movie Management', () => {
    it('should add a new movie', () => {
      const store = useMoviesStore()
      const newMovie = {
        title: 'Test Movie',
        director: 'Test Director',
        releaseDate: '2023-01-01',
        rating: 8.0,
        description: 'Test Description',
        poster: 'test.jpg'
      }
      store.addMovie(newMovie)
      expect(store.movies.length).toBe(8)
      expect(store.movies[7].title).toBe('Test Movie')
    })

    it('should remove a movie', () => {
      const store = useMoviesStore()
      const initialLength = store.movies.length
      store.removeMovie(0)
      expect(store.movies.length).toBe(initialLength - 1)
    })

    it('should update movie rating', () => {
      const store = useMoviesStore()
      const newRating = 9.5
      store.updateMovieRating(0, newRating)
      expect(store.sortedMovies[0].rating).toBe(newRating)
    })
  })

  describe('Movies Per Page', () => {
    it('should update movies per page', () => {
      const store = useMoviesStore()
      store.setMoviesPerPage(10)
      expect(store.moviesPerPage).toBe(10)
    })
  })
}) 