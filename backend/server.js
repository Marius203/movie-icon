const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer"); // Add this for file uploads

const app = express();
const PORT = 3000;

// Configure multer for trailer uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1073741824 }, // 1GB limit
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "1300mb" }));
app.use(express.urlencoded({ extended: true, limit: "1300mb" }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// POST new movie with trailer
app.post("/movies", upload.single("trailer"), (req, res) => {
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
    rating: parseFloat(rating),
    description,
    poster,
    trailer: req.file ? `/uploads/${req.file.filename}` : null,
  };

  data.movies.push(newMovie);
  writeData(data);

  res.status(201).json(newMovie);
});

// PUT update movie with trailer
app.put("/movies/:id", upload.single("trailer"), (req, res) => {
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

  // If a new trailer file is uploaded, use it, otherwise keep the existing one
  const trailerPath = req.file
    ? `/uploads/${req.file.filename}`
    : data.movies[movieIndex].trailer;

  data.movies[movieIndex] = {
    ...data.movies[movieIndex],
    title,
    director,
    releaseDate,
    rating: parseFloat(rating),
    description,
    poster,
    trailer: trailerPath,
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

// Add health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Only start the server if this file is run directly
if (require.main === module) {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(
      `Server is accessible on your local network at: http://${getLocalIP()}:${PORT}`
    );
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

// Helper function to get local IP address
function getLocalIP() {
  const interfaces = require("os").networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// Export the app for testing
module.exports = app;
