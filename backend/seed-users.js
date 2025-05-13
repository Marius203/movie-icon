const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Sample users
  const users = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: 'adminpassword', // In a real app, this should be hashed
      isAdmin: true,
    },
    {
      username: 'user',
      email: 'user@example.com',
      password: 'userpassword', // In a real app, this should be hashed
      isAdmin: false,
    },
  ];

  // Create users
  console.log('Creating users...');
  for (const user of users) {
    const createdUser = await prisma.users.create({
      data: user,
    });
    console.log(`Created user: ${createdUser.username}`);
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