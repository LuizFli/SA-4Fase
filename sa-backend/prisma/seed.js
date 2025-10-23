import prismaClient from '../../src/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const exists = await prismaClient.user.findUnique({ where: { email } });
  if (!exists) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'password', 10);
    await prismaClient.user.create({ data: { name: 'Admin', email, password: hashed, role: 'ADMIN' } });
    console.log('Admin user created:', email);
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
