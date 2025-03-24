import { faker } from '@faker-js/faker'

// Function to generate a random movie
function generateMovie() {
  const year = faker.number.int({ min: 1950, max: 2024 })
  const month = faker.number.int({ min: 1, max: 12 }).toString().padStart(2, '0')
  const day = faker.number.int({ min: 1, max: 28 }).toString().padStart(2, '0')
  const releaseDate = `${year}-${month}-${day}`

  return {
    title: faker.music.songName(),
    director: faker.person.fullName(),
    releaseDate,
    rating: faker.number.float({ min: 0, max: 10, precision: 0.1 }),
    description: faker.lorem.paragraph(),
    poster: faker.image.url({ width: 200, height: 300 })
  }
}

// Function to generate multiple movies
function generateMovies(count) {
  return Array.from({ length: count }, generateMovie)
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  const { type, count } = event.data

  if (type === 'GENERATE_MOVIES') {
    const movies = generateMovies(count)
    self.postMessage({ type: 'MOVIES_GENERATED', movies })
  }
}) 