const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Admin credentials
    const adminUsername = 'admin';
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123'; // You should change this to a secure password

    // Check if admin user already exists
    const existingAdmin = await prisma.Users.findFirst({
      where: {
        OR: [
          { username: adminUsername },
          { email: adminEmail }
        ]
      }
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Update the existing admin user
      const updatedAdmin = await prisma.Users.update({
        where: { id: existingAdmin.id },
        data: {
          password: hashedPassword,
          isAdmin: true
        }
      });
      
      console.log('Admin user updated successfully:', {
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        isAdmin: updatedAdmin.isAdmin
      });
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Create new admin user
      const newAdmin = await prisma.Users.create({
        data: {
          username: adminUsername,
          email: adminEmail,
          password: hashedPassword,
          isAdmin: true
        }
      });
      
      console.log('Admin user created successfully:', {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        isAdmin: newAdmin.isAdmin
      });
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser(); 