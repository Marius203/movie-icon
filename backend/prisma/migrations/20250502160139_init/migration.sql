-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "directorId" INTEGER,
    "release_date" TIMESTAMP(3),
    "rating" DOUBLE PRECISION,
    "description" TEXT,
    "poster" TEXT,
    "trailer" TEXT,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Director" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Director_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "Director"("id") ON DELETE SET NULL ON UPDATE CASCADE;
