import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMoviesStore } from '@/stores/movies'

describe('Movies Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useMoviesStore()
  })

  describe('sortedMovies', () => {
    it('should sort movies by title in ascending order when sortOption is titleAsc', () => {
      store.movies = [
        {
          title: 'Z Movie',
          director: 'Director Z',
          releaseDate: '2020-01-01',
          rating: 7.0,
          description: 'Test movie Z',
          poster: 'http://example.com/z.jpg',
        },
        {
          title: 'A Movie',
          director: 'Director A',
          releaseDate: '2019-01-01',
          rating: 9.0,
          description: 'Test movie A',
          poster: 'http://example.com/a.jpg',
        },
        {
          title: 'M Movie',
          director: 'Director M',
          releaseDate: '2018-01-01',
          rating: 8.0,
          description: 'Test movie M',
          poster: 'http://example.com/m.jpg',
        },
      ]

      store.setSortOption('titleAsc')

      const sortedMovies = store.sortedMovies

      expect(sortedMovies[0].title).toBe('A Movie')
      expect(sortedMovies[1].title).toBe('M Movie')
      expect(sortedMovies[2].title).toBe('Z Movie')

      expect(store.movies[0].title).toBe('Z Movie')
    })
  })
})
