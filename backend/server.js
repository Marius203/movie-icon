const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const dataFilePath = path.join(__dirname, "data.json");

// Helper function to read data
const readData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { movies: [] };
  }
};

// Helper function to write data
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// GET all movies with sorting, filtering, and pagination
app.get("/movies", (req, res) => {
  const data = readData();
  let movies = [...data.movies]; // Create a copy to avoid modifying original data

  // FILTERING
  // Filter by title (partial match)
  if (req.query.title) {
    const titleQuery = req.query.title.toLowerCase();
    movies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(titleQuery)
    );
  }

  // Filter by director (partial match)
  if (req.query.director) {
    const directorQuery = req.query.director.toLowerCase();
    movies = movies.filter((movie) =>
      movie.director.toLowerCase().includes(directorQuery)
    );
  }

  // SORTING
  const sort = req.query.sort;
  const order = req.query.order || "asc";

  if (sort === "title") {
    // Sort by title (ascending or descending)
    movies.sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return order === "desc" ? -comparison : comparison;
    });
  } else if (sort === "rating") {
    // Sort by rating (ascending or descending)
    movies.sort((a, b) => {
      const comparison = a.rating - b.rating;
      return order === "desc" ? -comparison : comparison;
    });
  }

  // PAGINATION
  const limit = parseInt(req.query.limit) || movies.length;
  const offset = parseInt(req.query.offset) || 0;

  // Apply pagination
  const paginatedMovies = movies.slice(offset, offset + limit);

  res.json(paginatedMovies);
});

// GET single movie
app.get("/movies/:id", (req, res) => {
  const data = readData();
  const movie = data.movies.find(
    (movie) => movie.id === parseInt(req.params.id)
  );

  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }

  res.json(movie);
});

// POST new movie
app.post("/movies", (req, res) => {
  const data = readData();
  const { title, director, releaseDate, rating, description, poster } =
    req.body;

  if (!title || !director || !description) {
    return res
      .status(400)
      .json({ message: "Title, director and description are required" });
  }

  // Generate new ID (max ID + 1)
  const maxId = data.movies.reduce(
    (max, movie) => (movie.id > max ? movie.id : max),
    0
  );

  const newMovie = {
    id: maxId + 1,
    title,
    director,
    releaseDate,
    rating,
    description,
    poster,
  };

  data.movies.push(newMovie);
  writeData(data);

  res.status(201).json(newMovie);
});

// PUT update movie
app.put("/movies/:id", (req, res) => {
  const data = readData();
  const { title, director, releaseDate, rating, description, poster } =
    req.body;

  if (!title || !director || !description) {
    return res
      .status(400)
      .json({ message: "Title, director and description are required" });
  }

  const movieId = parseInt(req.params.id);
  const movieIndex = data.movies.findIndex((movie) => movie.id === movieId);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  data.movies[movieIndex] = {
    ...data.movies[movieIndex],
    title,
    director,
    releaseDate,
    rating,
    description,
    poster,
  };

  writeData(data);
  res.json(data.movies[movieIndex]);
});

// DELETE movie
app.delete("/movies/:id", (req, res) => {
  const data = readData();
  const movieId = parseInt(req.params.id);
  const movieIndex = data.movies.findIndex((movie) => movie.id === movieId);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  data.movies.splice(movieIndex, 1);
  writeData(data);

  res.status(204).send();
});

// Only start the server if this file is run directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });
}

// Export the app for testing
module.exports = app;
