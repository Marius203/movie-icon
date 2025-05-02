const { PrismaClient } = require("@prisma/client");
const { readFileSync } = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function seedFromJson() {
  try {
    // Read the data.json file
    const dataFilePath = path.join(__dirname, "..", "data.json");
    const data = JSON.parse(readFileSync(dataFilePath, "utf8"));

    console.log(`Found ${data.movies.length} movies in data.json`);

    // Process each movie
    for (const movie of data.movies) {
      // Check if director exists, if not create it
      let director = null;
      if (movie.director) {
        director = await prisma.director.findFirst({
          where: { name: movie.director },
        });

        if (!director) {
          director = await prisma.director.create({
            data: { name: movie.director },
          });
          console.log(`Created director: ${director.name}`);
        }
      }

      // Check if movie already exists
      const existingMovie = await prisma.movie.findFirst({
        where: { title: movie.title },
      });

      if (!existingMovie) {
        // Create movie
        await prisma.movie.create({
          data: {
            title: movie.title,
            directorId: director?.id || null,
            release_date: movie.releaseDate
              ? new Date(movie.releaseDate)
              : null,
            rating: movie.rating || null,
            description: movie.description || null,
            poster: movie.poster || null,
            trailer: movie.trailer || null,
          },
        });
        console.log(`Created movie: ${movie.title}`);
      } else {
        console.log(`Movie already exists: ${movie.title}`);
      }
    }

    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log("Starting database migration and seeding...");

    // Seed the database with data from data.json
    await seedFromJson();

    console.log("Database migration and seeding completed successfully!");
  } catch (error) {
    console.error("Error during migration and seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
