const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer"); // Add this for file uploads
const { startMovieGeneration } = require("./movieGenerator");
const WebSocket = require("ws");
const prisma = require("./prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // In production, use environment variable

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

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*", // Allow requests from the frontend domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
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

// POST new user registration
app.post("/register", async (req, res) => {
  try {
    console.log("Registration request body:", req.body);
    const { username, email, password } = req.body;

    // Ensure username, email, and password are strings
    const usernameStr = String(username);
    const emailStr = String(email);
    const passwordStr = String(password);

    console.log("Processed registration data:", {
      usernameStr,
      emailStr,
      passwordStr,
    });

    // Build OR array only with defined values
    const orArray = [];
    if (usernameStr) orArray.push({ username: usernameStr });
    if (emailStr) orArray.push({ email: emailStr });

    // Check if user already exists
    const existingUser = await prisma.Users.findFirst({
      where: {
        OR: orArray,
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(passwordStr, 10);

    // Create new user
    const newUser = await prisma.Users.create({
      data: {
        username: usernameStr,
        email: emailStr,
        password: hashedPassword, // Store hashed password
        isAdmin: false,
      },
    });

    // Don't send the password back in the response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

// POST user login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await prisma.Users.findFirst({
      where: { username },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Don't send the password back in the response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN format

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    // Ensure req.user.id is always set
    if (user.userId && !user.id) user.id = user.userId;
    req.user = user;
    next();
  });
};

// User profile endpoint
app.get("/user/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data from database
    const user = await prisma.Users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        isAdmin: true,
        // Include user's movies if needed
        movies: {
          select: {
            id: true,
            movie: {
              select: {
                id: true,
                title: true,
                release_date: true,
                rating: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format the movies data
    const formattedUser = {
      ...user,
      movies: user.movies.map((um) => ({
        id: um.movie.id,
        title: um.movie.title,
        year: um.movie.release_date
          ? new Date(um.movie.release_date).getFullYear()
          : null,
        rating: um.movie.rating,
      })),
    };

    res.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
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

// Add movie to user's list
app.post("/user/movies", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, rating, movie } = req.body;

    if (!movieId && !movie) {
      return res
        .status(400)
        .json({ message: "Movie ID or movie data is required" });
    }

    let movieRecord;

    // If movieId is provided, find the movie
    if (movieId) {
      movieRecord = await prisma.movie.findUnique({
        where: { id: movieId },
      });

      if (!movieRecord) {
        return res.status(404).json({ message: "Movie not found" });
      }
    }
    // If movie data is provided, create the movie
    else if (movie) {
      // Check if director exists, if not create it
      let directorRecord = await prisma.director.findFirst({
        where: { name: movie.director },
      });

      if (!directorRecord) {
        directorRecord = await prisma.director.create({
          data: { name: movie.director },
        });
      }

      // Create the movie
      movieRecord = await prisma.movie.create({
        data: {
          title: movie.title,
          directorId: directorRecord.id,
          release_date: movie.releaseDate ? new Date(movie.releaseDate) : null,
          rating: movie.rating ? parseFloat(movie.rating) : null,
          description: movie.description || "",
          poster: movie.poster || null,
          trailer: movie.trailer || null,
        },
      });
    }

    // Check if user already has this movie
    const existingUserMovie = await prisma.userMovie.findFirst({
      where: {
        userId: userId,
        movieId: movieRecord.id,
      },
    });

    if (existingUserMovie) {
      return res.status(400).json({ message: "Movie already in your list" });
    }

    // Add movie to user's list
    const userMovie = await prisma.userMovie.create({
      data: {
        userId: userId,
        movieId: movieRecord.id,
        rating: rating || null,
      },
    });

    res.status(201).json(userMovie);
  } catch (error) {
    console.error("Error adding movie to user list:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update movie rating
app.put("/user/movies/:movieId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    const { rating } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    // Check if user has this movie
    const userMovie = await prisma.userMovie.findFirst({
      where: {
        userId: userId,
        movieId: movieId,
      },
    });

    if (!userMovie) {
      return res.status(404).json({ message: "Movie not found in your list" });
    }

    // Update rating
    const updatedUserMovie = await prisma.userMovie.update({
      where: {
        id: userMovie.id,
      },
      data: {
        rating: rating,
      },
    });

    res.json(updatedUserMovie);
  } catch (error) {
    console.error("Error updating movie rating:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove movie from user's list
app.delete("/user/movies/:movieId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    // Check if user has this movie
    const userMovie = await prisma.userMovie.findFirst({
      where: {
        userId: userId,
        movieId: movieId,
      },
    });

    if (!userMovie) {
      return res.status(404).json({ message: "Movie not found in your list" });
    }

    // Remove movie from user's list
    await prisma.userMovie.delete({
      where: {
        id: userMovie.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error removing movie from user list:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's movies
app.get("/user/movies", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's movies
    const userMovies = await prisma.userMovie.findMany({
      where: {
        userId: userId,
      },
      include: {
        movie: true,
      },
    });

    // Format response
    const movies = userMovies.map((um) => ({
      id: um.movie.id,
      title: um.movie.title,
      director: um.movie.director ? um.movie.director.name : null,
      releaseDate: um.movie.release_date
        ? um.movie.release_date.toISOString().split("T")[0]
        : null,
      rating: um.rating || um.movie.rating,
      description: um.movie.description,
      poster: um.movie.poster,
    }));

    res.json(movies);
  } catch (error) {
    console.error("Error fetching user movies:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { app, server };
