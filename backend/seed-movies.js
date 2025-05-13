const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Sample directors
  const directors = [
    { name: 'Christopher Nolan' },
    { name: 'Quentin Tarantino' },
    { name: 'Steven Spielberg' },
    { name: 'James Cameron' },
    { name: 'Martin Scorsese' },
  ];

  // Create directors
  console.log('Creating directors...');
  const createdDirectors = [];
  for (const director of directors) {
    const createdDirector = await prisma.director.create({
      data: director,
    });
    createdDirectors.push(createdDirector);
    console.log(`Created director: ${createdDirector.name}`);
  }

  // Sample movies
  const movies = [
    {
      title: 'Inception',
      directorId: createdDirectors[0].id,
      release_date: new Date('2010-07-16'),
      rating: 8.8,
      description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      poster: 'https://example.com/inception.jpg',
      trailer: 'https://example.com/inception-trailer.mp4',
    },
    {
      title: 'The Dark Knight',
      directorId: createdDirectors[0].id,
      release_date: new Date('2008-07-18'),
      rating: 9.0,
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      poster: 'https://example.com/dark-knight.jpg',
      trailer: 'https://example.com/dark-knight-trailer.mp4',
    },
    {
      title: 'Pulp Fiction',
      directorId: createdDirectors[1].id,
      release_date: new Date('1994-10-14'),
      rating: 8.9,
      description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
      poster: 'https://example.com/pulp-fiction.jpg',
      trailer: 'https://example.com/pulp-fiction-trailer.mp4',
    },
    {
      title: 'Inglourious Basterds',
      directorId: createdDirectors[1].id,
      release_date: new Date('2009-08-21'),
      rating: 8.3,
      description: 'In Nazi-occupied France during World War II, a plan to assassinate Nazi leaders by a group of Jewish U.S. soldiers coincides with a theatre owner\'s vengeful plans for the same.',
      poster: 'https://example.com/inglourious-basterds.jpg',
      trailer: 'https://example.com/inglourious-basterds-trailer.mp4',
    },
    {
      title: 'Jurassic Park',
      directorId: createdDirectors[2].id,
      release_date: new Date('1993-06-11'),
      rating: 8.1,
      description: 'A pragmatic paleontologist visiting an almost complete theme park is tasked with protecting a couple of kids after a power failure causes the park\'s cloned dinosaurs to run loose.',
      poster: 'https://example.com/jurassic-park.jpg',
      trailer: 'https://example.com/jurassic-park-trailer.mp4',
    },
    {
      title: 'Schindler\'s List',
      directorId: createdDirectors[2].id,
      release_date: new Date('1994-02-04'),
      rating: 9.0,
      description: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.',
      poster: 'https://example.com/schindlers-list.jpg',
      trailer: 'https://example.com/schindlers-list-trailer.mp4',
    },
    {
      title: 'Avatar',
      directorId: createdDirectors[3].id,
      release_date: new Date('2009-12-18'),
      rating: 7.8,
      description: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
      poster: 'https://example.com/avatar.jpg',
      trailer: 'https://example.com/avatar-trailer.mp4',
    },
    {
      title: 'Titanic',
      directorId: createdDirectors[3].id,
      release_date: new Date('1997-12-19'),
      rating: 7.9,
      description: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
      poster: 'https://example.com/titanic.jpg',
      trailer: 'https://example.com/titanic-trailer.mp4',
    },
    {
      title: 'The Departed',
      directorId: createdDirectors[4].id,
      release_date: new Date('2006-10-06'),
      rating: 8.5,
      description: 'An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.',
      poster: 'https://example.com/the-departed.jpg',
      trailer: 'https://example.com/the-departed-trailer.mp4',
    },
    {
      title: 'Goodfellas',
      directorId: createdDirectors[4].id,
      release_date: new Date('1990-09-19'),
      rating: 8.7,
      description: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.',
      poster: 'https://example.com/goodfellas.jpg',
      trailer: 'https://example.com/goodfellas-trailer.mp4',
    },
  ];

  // Create movies
  console.log('Creating movies...');
  for (const movie of movies) {
    const createdMovie = await prisma.movie.create({
      data: movie,
    });
    console.log(`Created movie: ${createdMovie.title}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 