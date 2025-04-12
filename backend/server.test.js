const request = require("supertest");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

// Import the server app
const app = require("./server");

// Path to the data file
const dataFilePath = path.join(__dirname, "data.json");

// Backup the original data file
let originalData;

// Setup and teardown
beforeAll(() => {
  // Read the original data
  originalData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));

  // Create a test data file
  const testData = {
    movies: [
      {
        id: 1,
        title: "Test Movie 1",
        director: "Test Director 1",
        releaseDate: "2020-01-01",
        rating: 8.5,
        description: "Test description 1",
        poster: "https://example.com/poster1.jpg",
      },
      {
        id: 2,
        title: "Test Movie 2",
        director: "Test Director 2",
        releaseDate: "2021-01-01",
        rating: 7.5,
        description: "Test description 2",
        poster: "https://example.com/poster2.jpg",
      },
    ],
  };

  // Write test data to the file
  fs.writeFileSync(dataFilePath, JSON.stringify(testData, null, 2));
});

afterAll(() => {
  // Restore the original data
  fs.writeFileSync(dataFilePath, JSON.stringify(originalData, null, 2));
});

describe("Movie API", () => {
  // Test GET /movies endpoint
  describe("GET /movies", () => {
    it("should return all movies", async () => {
      const response = await request(app).get("/movies");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe("Test Movie 1");
      expect(response.body[1].title).toBe("Test Movie 2");
    });

    it("should filter movies by title", async () => {
      const response = await request(app).get("/movies?title=Movie 1");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe("Test Movie 1");
    });

    it("should filter movies by director", async () => {
      const response = await request(app).get("/movies?director=Director 2");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].director).toBe("Test Director 2");
    });

    it("should sort movies by title", async () => {
      const response = await request(app).get("/movies?sort=title&order=asc");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe("Test Movie 1");
      expect(response.body[1].title).toBe("Test Movie 2");
    });

    it("should sort movies by rating", async () => {
      const response = await request(app).get("/movies?sort=rating&order=desc");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].rating).toBe(8.5);
      expect(response.body[1].rating).toBe(7.5);
    });
  });

  // Test GET /movies/:id endpoint
  describe("GET /movies/:id", () => {
    it("should return a single movie by id", async () => {
      const response = await request(app).get("/movies/1");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe("Test Movie 1");
    });

    it("should return 404 for non-existent movie id", async () => {
      const response = await request(app).get("/movies/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Movie not found");
    });
  });

  // Test POST /movies endpoint
  describe("POST /movies", () => {
    it("should create a new movie", async () => {
      const newMovie = {
        title: "New Test Movie",
        director: "New Test Director",
        releaseDate: "2022-01-01",
        rating: 9.0,
        description: "New test description",
        poster: "https://example.com/new-poster.jpg",
      };

      const response = await request(app).post("/movies").send(newMovie);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newMovie.title);
      expect(response.body.director).toBe(newMovie.director);
      expect(response.body.id).toBeDefined();

      // Verify the movie was added to the data file
      const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
      const addedMovie = data.movies.find((m) => m.id === response.body.id);
      expect(addedMovie).toBeDefined();
      expect(addedMovie.title).toBe(newMovie.title);
    });

    it("should return 400 if required fields are missing", async () => {
      const incompleteMovie = {
        title: "Incomplete Movie",
        // Missing director and description
        releaseDate: "2022-01-01",
        rating: 9.0,
        poster: "https://example.com/poster.jpg",
      };

      const response = await request(app).post("/movies").send(incompleteMovie);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Title, director and description are required"
      );
    });
  });

  // Test PUT /movies/:id endpoint
  describe("PUT /movies/:id", () => {
    it("should update an existing movie", async () => {
      // First, create a new movie to update
      const newMovie = {
        title: "Movie To Update",
        director: "Director To Update",
        releaseDate: "2022-01-01",
        rating: 8.0,
        description: "Description to update",
        poster: "https://example.com/update-poster.jpg",
      };

      const createResponse = await request(app).post("/movies").send(newMovie);

      const movieId = createResponse.body.id;

      // Now update the movie
      const updatedMovie = {
        title: "Updated Movie",
        director: "Updated Director",
        releaseDate: "2022-02-01",
        rating: 9.0,
        description: "Updated description",
        poster: "https://example.com/updated-poster.jpg",
      };

      const response = await request(app)
        .put(`/movies/${movieId}`)
        .send(updatedMovie);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedMovie.title);
      expect(response.body.director).toBe(updatedMovie.director);
      expect(response.body.id).toBe(movieId);

      // Verify the movie was updated in the data file
      const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
      const updatedMovieInFile = data.movies.find((m) => m.id === movieId);
      expect(updatedMovieInFile.title).toBe(updatedMovie.title);
    });

    it("should return 404 for non-existent movie id", async () => {
      const updatedMovie = {
        title: "Updated Movie",
        director: "Updated Director",
        releaseDate: "2022-02-01",
        rating: 9.0,
        description: "Updated description",
        poster: "https://example.com/updated-poster.jpg",
      };

      const response = await request(app).put("/movies/999").send(updatedMovie);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Movie not found");
    });

    it("should return 400 if required fields are missing", async () => {
      // First, create a new movie to update
      const newMovie = {
        title: "Movie To Update",
        director: "Director To Update",
        releaseDate: "2022-01-01",
        rating: 8.0,
        description: "Description to update",
        poster: "https://example.com/update-poster.jpg",
      };

      const createResponse = await request(app).post("/movies").send(newMovie);

      const movieId = createResponse.body.id;

      // Now try to update with incomplete data
      const incompleteMovie = {
        title: "Updated Movie",
        // Missing director and description
        releaseDate: "2022-02-01",
        rating: 9.0,
        poster: "https://example.com/updated-poster.jpg",
      };

      const response = await request(app)
        .put(`/movies/${movieId}`)
        .send(incompleteMovie);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Title, director and description are required"
      );
    });
  });

  // Test DELETE /movies/:id endpoint
  describe("DELETE /movies/:id", () => {
    it("should delete an existing movie", async () => {
      // First, create a new movie to delete
      const newMovie = {
        title: "Movie To Delete",
        director: "Director To Delete",
        releaseDate: "2022-01-01",
        rating: 8.0,
        description: "Description to delete",
        poster: "https://example.com/delete-poster.jpg",
      };

      const createResponse = await request(app).post("/movies").send(newMovie);

      const movieId = createResponse.body.id;

      // Now delete the movie
      const response = await request(app).delete(`/movies/${movieId}`);

      expect(response.status).toBe(204);

      // Verify the movie was deleted from the data file
      const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
      const deletedMovie = data.movies.find((m) => m.id === movieId);
      expect(deletedMovie).toBeUndefined();
    });

    it("should return 404 for non-existent movie id", async () => {
      const response = await request(app).delete("/movies/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Movie not found");
    });
  });
});
