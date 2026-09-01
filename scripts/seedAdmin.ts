import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

import crypto from 'crypto';

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@libra.com';
  const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin account (${email}) already exists.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name: process.env.SEED_ADMIN_NAME || 'Super Admin',
    },
  });
  console.log(`✅ Admin account created successfully!`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
}

seed().catch(console.error).finally(() => prisma.$disconnect());
