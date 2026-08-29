import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function seed() {
  const existing = await prisma.admin.findUnique({ where: { email: 'admin@libra.com' } });
  if (existing) {
    console.log('Admin account already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.admin.create({
    data: {
      email: 'admin@libra.com',
      password: hashedPassword,
      name: 'Super Admin',
    },
  });
  console.log('✅ Default Admin account created successfully!');
  console.log('📧 Email: admin@libra.com');
  console.log('🔑 Password: admin123');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
