import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMoviesStore } from '@/stores/movies'

describe('Movies Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useMoviesStore()
  })

  describe('Movie Classification', () => {
    it('should classify movies before 1980 as oldies', () => {
      expect(store.getMovieClassification('1979-12-31')).toBe('👴')
    })

    it('should classify movies from 1980-2010 as iconic', () => {
      expect(store.getMovieClassification('1980-01-01')).toBe('👨')
      expect(store.getMovieClassification('2010-12-31')).toBe('👨')
    })

    it('should classify movies from 2011 onwards as new gen', () => {
      expect(store.getMovieClassification('2011-01-01')).toBe('👶')
    })
  })

  describe('Adding Movies', () => {
    it('should add a new movie to the store', () => {
      const newMovie = {
        title: 'Test Movie',
        director: 'Test Director',
        releaseDate: '2020-01-01',
        rating: 8.5,
        description: 'Test description',
        poster: 'http://example.com/poster.jpg'
      }

      store.addMovie(newMovie)
      expect(store.movies).toContainEqual(newMovie)
    })
  })

  describe('Removing Movies', () => {
    it('should remove a movie from the store', () => {
      const movieToRemove = store.movies[0]
      const originalLength = store.movies.length

      store.removeMovie(0)
      expect(store.movies.length).toBe(originalLength - 1)
      expect(store.movies).not.toContainEqual(movieToRemove)
    })
  })

  describe('Updating Movie Rating', () => {
    it('should update a movie rating', () => {
      const movieIndex = 0
      const newRating = 9.5
      const originalRating = store.movies[movieIndex].rating

      store.updateMovieRating(movieIndex, newRating)
      expect(store.movies[movieIndex].rating).toBe(newRating)
      expect(store.movies[movieIndex].rating).not.toBe(originalRating)
    })
  })

  describe('Sorting Movies', () => {
    beforeEach(() => {
      // Set up test data with known values
      store.movies = [
        {
          title: 'Z Movie',
          director: 'Director Z',
          releaseDate: '2020-01-01',
          rating: 7.0,
          description: 'Test movie Z',
          poster: 'http://example.com/z.jpg'
        },
        {
          title: 'A Movie',
          director: 'Director A',
          releaseDate: '2019-01-01',
          rating: 9.0,
          description: 'Test movie A',
          poster: 'http://example.com/a.jpg'
        },
        {
          title: 'M Movie',
          director: 'Director M',
          releaseDate: '2018-01-01',
          rating: 8.0,
          description: 'Test movie M',
          poster: 'http://example.com/m.jpg'
        }
      ]
    })

    it('should sort movies by title in ascending order', () => {
      store.setSortOption('titleAsc')
      const sortedMovies = store.sortedMovies

      expect(sortedMovies[0].title).toBe('A Movie')
      expect(sortedMovies[1].title).toBe('M Movie')
      expect(sortedMovies[2].title).toBe('Z Movie')
    })

    it('should sort movies by title in descending order', () => {
      store.setSortOption('titleDesc')
      const sortedMovies = store.sortedMovies

      expect(sortedMovies[0].title).toBe('Z Movie')
      expect(sortedMovies[1].title).toBe('M Movie')
      expect(sortedMovies[2].title).toBe('A Movie')
    })

    it('should sort movies by rating in ascending order', () => {
      store.setSortOption('ratingAsc')
      const sortedMovies = store.sortedMovies

      expect(sortedMovies[0].rating).toBe(7.0)
      expect(sortedMovies[1].rating).toBe(8.0)
      expect(sortedMovies[2].rating).toBe(9.0)
    })

    it('should sort movies by rating in descending order', () => {
      store.setSortOption('ratingDesc')
      const sortedMovies = store.sortedMovies

      expect(sortedMovies[0].rating).toBe(9.0)
      expect(sortedMovies[1].rating).toBe(8.0)
      expect(sortedMovies[2].rating).toBe(7.0)
    })

    it('should sort movies by classification', () => {
      // Add movies from different eras
      store.movies = [
        {
          title: 'New Movie',
          director: 'Director New',
          releaseDate: '2020-01-01',
          rating: 8.0,
          description: 'New movie',
          poster: 'http://example.com/new.jpg'
        },
        {
          title: 'Old Movie',
          director: 'Director Old',
          releaseDate: '1970-01-01',
          rating: 9.0,
          description: 'Old movie',
          poster: 'http://example.com/old.jpg'
        },
        {
          title: 'Iconic Movie',
          director: 'Director Iconic',
          releaseDate: '1990-01-01',
          rating: 7.0,
          description: 'Iconic movie',
          poster: 'http://example.com/iconic.jpg'
        }
      ]

      store.setSortOption('classification')
      const sortedMovies = store.sortedMovies

      // Should be sorted: Oldies (👴) -> Iconic (👨) -> New Gen (👶)
      expect(store.getMovieClassification(sortedMovies[0].releaseDate)).toBe('👴')
      expect(store.getMovieClassification(sortedMovies[1].releaseDate)).toBe('👨')
      expect(store.getMovieClassification(sortedMovies[2].releaseDate)).toBe('👶')
    })

    it('should maintain original order when sort option is default', () => {
      store.setSortOption('default')
      const sortedMovies = store.sortedMovies

      expect(sortedMovies).toEqual(store.movies)
    })
  })
})