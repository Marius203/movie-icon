const axios = require("axios");
const { faker } = require("@faker-js/faker");

// Function to generate a random movie
function generateMovie() {
  const year = faker.number.int({ min: 1950, max: 2024 });
  const month = faker.number
    .int({ min: 1, max: 12 })
    .toString()
    .padStart(2, "0");
  const day = faker.number.int({ min: 1, max: 28 }).toString().padStart(2, "0");
  const releaseDate = `${year}-${month}-${day}`;

  return {
    title: faker.music.songName(),
    director: faker.person.fullName(),
    releaseDate,
    rating: faker.number.float({ min: 0, max: 10, precision: 0.1 }),
    description: faker.lorem.paragraph(),
    poster: faker.image.url({ width: 200, height: 300 }),
  };
}

// Function to post a movie to the API
async function postMovie(movie) {
  try {
    const response = await axios.post("http://localhost:3000/movies", movie);
    console.log(`Posted new movie: ${movie.title}`);
    return response.data;
  } catch (error) {
    console.error("Error posting movie:", error.message);
    return null;
  }
}

// Function to start generating and posting movies
function startMovieGeneration(interval = 5000) {
  // Default interval: 5 seconds
  console.log("Starting movie generation service...");

  let timer = null;

  const generateAndPost = async () => {
    const movie = generateMovie();
    await postMovie(movie);
  };

  // Generate first movie immediately
  generateAndPost();

  // Set up interval for continuous generation
  timer = setInterval(generateAndPost, interval);

  // Return function to stop the generation
  return () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      console.log("Stopped movie generation service");
    }
  };
}

// Export the start function
module.exports = { startMovieGeneration };

// If this file is run directly, start the generation
if (require.main === module) {
  const stopGeneration = startMovieGeneration();

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    stopGeneration();
    process.exit(0);
  });
}
