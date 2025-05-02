const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer"); // Add this for file uploads
const { startMovieGeneration } = require("./movieGenerator");
const WebSocket = require("ws");
const prisma = require("./prisma/client");

const app = express();
const PORT = 3000;

// Add state for movie generation
let stopGeneration = null;
let isGenerating = false;
let wss = null;

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

// GET all movies with sorting, filtering, and pagination
app.get("/movies", async (req, res) => {
  try {
    const {
      title,
      director,
      sort,
      order = "asc",
      limit,
      offset = 0,
    } = req.query;

    // Build filter conditions
    const whereClause = {};

    if (title) {
      whereClause.title = {
        contains: title,
        mode: "insensitive",
      };
    }

    // For director filter, we need to use a relation filter
    if (director) {
      whereClause.director = {
        name: {
          contains: director,
          mode: "insensitive",
        },
      };
    }

    // Build ordering
    const orderBy = [];
    if (sort === "title") {
      orderBy.push({ title: order.toLowerCase() });
    } else if (sort === "rating") {
      orderBy.push({ rating: order.toLowerCase() });
    }

    // Query with pagination
    const parsedLimit = limit ? parseInt(limit) : undefined;
    const parsedOffset = parseInt(offset);

    const movies = await prisma.movie.findMany({
      where: whereClause,
      orderBy,
      skip: parsedOffset,
      take: parsedLimit,
      include: {
        director: true,
      },
    });

    // Transform the response to match the expected format
    const formattedMovies = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      director: movie.director ? movie.director.name : null,
      releaseDate: movie.release_date
        ? movie.release_date.toISOString().split("T")[0]
        : null,
      rating: movie.rating,
      description: movie.description,
      poster: movie.poster,
      trailer: movie.trailer,
    }));

    res.json(formattedMovies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ message: "Error fetching movies" });
  }
});

// GET single movie
app.get("/movies/:id", async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: { director: true },
    });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Format the response to match the expected structure
    const formattedMovie = {
      id: movie.id,
      title: movie.title,
      director: movie.director ? movie.director.name : null,
      releaseDate: movie.release_date
        ? movie.release_date.toISOString().split("T")[0]
        : null,
      rating: movie.rating,
      description: movie.description,
      poster: movie.poster,
      trailer: movie.trailer,
    };

    res.json(formattedMovie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({ message: "Error fetching movie" });
  }
});

// POST new movie with trailer
app.post("/movies", upload.single("trailer"), async (req, res) => {
  try {
    const { title, director, releaseDate, rating, description, poster } =
      req.body;

    if (!title || !director || !description) {
      return res
        .status(400)
        .json({ message: "Title, director and description are required" });
    }

    // Check if director exists, if not create it
    let directorRecord = await prisma.director.findFirst({
      where: { name: director },
    });

    if (!directorRecord) {
      directorRecord = await prisma.director.create({
        data: { name: director },
      });
    }

    // Create the movie
    const newMovie = await prisma.movie.create({
      data: {
        title,
        directorId: directorRecord.id,
        release_date: releaseDate ? new Date(releaseDate) : null,
        rating: rating ? parseFloat(rating) : null,
        description,
        poster,
        trailer: req.file ? `/uploads/${req.file.filename}` : null,
      },
      include: { director: true },
    });

    // Format the response to match expected structure
    const formattedMovie = {
      id: newMovie.id,
      title: newMovie.title,
      director: newMovie.director ? newMovie.director.name : null,
      releaseDate: newMovie.release_date
        ? newMovie.release_date.toISOString().split("T")[0]
        : null,
      rating: newMovie.rating,
      description: newMovie.description,
      poster: newMovie.poster,
      trailer: newMovie.trailer,
    };

    res.status(201).json(formattedMovie);
  } catch (error) {
    console.error("Error creating movie:", error);
    res.status(500).json({ message: "Error creating movie" });
  }
});

// PUT update movie with trailer
app.put("/movies/:id", upload.single("trailer"), async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const { title, director, releaseDate, rating, description, poster } =
      req.body;

    if (!title || !director || !description) {
      return res
        .status(400)
        .json({ message: "Title, director and description are required" });
    }

    // Check if movie exists
    const existingMovie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!existingMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Check if director exists, if not create it
    let directorRecord = await prisma.director.findFirst({
      where: { name: director },
    });

    if (!directorRecord) {
      directorRecord = await prisma.director.create({
        data: { name: director },
      });
    }

    // If a new trailer file is uploaded, use it, otherwise keep the existing one
    const trailerPath = req.file
      ? `/uploads/${req.file.filename}`
      : existingMovie.trailer;

    // Update the movie
    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: {
        title,
        directorId: directorRecord.id,
        release_date: releaseDate ? new Date(releaseDate) : null,
        rating: rating ? parseFloat(rating) : null,
        description,
        poster,
        trailer: trailerPath,
      },
      include: { director: true },
    });

    // Format the response to match expected structure
    const formattedMovie = {
      id: updatedMovie.id,
      title: updatedMovie.title,
      director: updatedMovie.director ? updatedMovie.director.name : null,
      releaseDate: updatedMovie.release_date
        ? updatedMovie.release_date.toISOString().split("T")[0]
        : null,
      rating: updatedMovie.rating,
      description: updatedMovie.description,
      poster: updatedMovie.poster,
      trailer: updatedMovie.trailer,
    };

    res.json(formattedMovie);
  } catch (error) {
    console.error("Error updating movie:", error);
    res.status(500).json({ message: "Error updating movie" });
  }
});

// DELETE movie
app.delete("/movies/:id", async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);

    // Check if movie exists
    const existingMovie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!existingMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Delete the movie
    await prisma.movie.delete({
      where: { id: movieId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting movie:", error);
    res.status(500).json({ message: "Error deleting movie" });
  }
});

// Add health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Create WebSocket server for movie generation
function createWebSocketServer(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection established");

    ws.on("message", (message) => {
      const data = JSON.parse(message);

      if (data.type === "START_GENERATION") {
        if (!isGenerating) {
          stopGeneration = startMovieGeneration(5000, async (movie) => {
            try {
              // First, create or find director
              let directorRecord = await prisma.director.findFirst({
                where: { name: movie.director },
              });

              if (!directorRecord) {
                directorRecord = await prisma.director.create({
                  data: { name: movie.director },
                });
              }

              // Create the movie in the database
              const newMovie = await prisma.movie.create({
                data: {
                  title: movie.title,
                  directorId: directorRecord.id,
                  release_date: movie.releaseDate
                    ? new Date(movie.releaseDate)
                    : null,
                  rating: movie.rating ? parseFloat(movie.rating) : null,
                  description: movie.description,
                  poster: movie.poster,
                  trailer: movie.trailer,
                },
                include: { director: true },
              });

              // Format to match expected structure
              const formattedMovie = {
                id: newMovie.id,
                title: newMovie.title,
                director: newMovie.director ? newMovie.director.name : null,
                releaseDate: newMovie.release_date
                  ? newMovie.release_date.toISOString().split("T")[0]
                  : null,
                rating: newMovie.rating,
                description: newMovie.description,
                poster: newMovie.poster,
                trailer: newMovie.trailer,
              };

              // Broadcast new movie to all connected clients
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    JSON.stringify({ type: "NEW_MOVIE", movie: formattedMovie })
                  );
                }
              });
            } catch (error) {
              console.error("Error generating movie:", error);
            }
          });
          isGenerating = true;
          ws.send(JSON.stringify({ type: "GENERATION_STARTED" }));
        }
      } else if (data.type === "STOP_GENERATION") {
        if (isGenerating && stopGeneration) {
          stopGeneration();
          isGenerating = false;
          ws.send(JSON.stringify({ type: "GENERATION_STOPPED" }));
        }
      }
    });
  });
}

// Start the server
const server = app.listen(PORT, "0.0.0.0", () => {
  const address = server.address();
  console.log(`Server is running on http://${getLocalIP()}:${address.port}`);
  createWebSocketServer(server);
});

function getLocalIP() {
  const { networkInterfaces } = require("os");
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  // Return the first IP found
  for (const name of Object.keys(results)) {
    if (results[name].length > 0) {
      return results[name][0];
    }
  }

  return "localhost";
}

// Add this for proper shutdown and cleanup
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { app, server };
