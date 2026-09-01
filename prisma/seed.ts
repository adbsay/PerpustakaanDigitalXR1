import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:bnrgxplwzqp@localhost:5432/libra_db";
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function seedRestore() {
  console.log('🔄 Checking database restore file...');
  const backupPath = path.join(process.cwd(), 'prisma', 'database_backup.json');
  
  if (!fs.existsSync(backupPath)) {
    console.log('ℹ️ No database_backup.json found. Skipping database restore.');
    return;
  }

  const raw = fs.readFileSync(backupPath, 'utf8');
  const db = JSON.parse(raw);

  console.log('🚀 Restoring database records from JSON backup...');

  // 1. Admins
  if (db.admins && db.admins.length > 0) {
    for (const item of db.admins) {
      await prisma.admin.upsert({
        where: { id: item.id },
        update: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
        create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
      });
    }
    console.log(`✅ Admins restored (${db.admins.length})`);
  }

  // 2. Publishers
  if (db.publishers && db.publishers.length > 0) {
    for (const item of db.publishers) {
      await prisma.publisher.upsert({
        where: { id: item.id },
        update: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
        create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
      });
    }
    console.log(`✅ Publishers restored (${db.publishers.length})`);
  }

  // 3. Categories
  if (db.categories && db.categories.length > 0) {
    for (const item of db.categories) {
      await prisma.category.upsert({
        where: { id: item.id },
        update: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
        create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
      });
    }
    console.log(`✅ Categories restored (${db.categories.length})`);
  }

  // 4. Books
  if (db.books && db.books.length > 0) {
    for (const item of db.books) {
      await prisma.book.upsert({
        where: { id: item.id },
        update: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
        create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
      });
    }
    console.log(`✅ Books restored (${db.books.length})`);
  }

  // 5. Announcements
  if (db.announcements && db.announcements.length > 0) {
    for (const item of db.announcements) {
      await prisma.announcement.upsert({
        where: { id: item.id },
        update: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
        create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
      });
    }
    console.log(`✅ Announcements restored (${db.announcements.length})`);
  }

  // 6. Reports
  if (db.reports && db.reports.length > 0) {
    for (const item of db.reports) {
      await prisma.report.upsert({
        where: { id: item.id },
        update: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
        create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
      });
    }
    console.log(`✅ Reports restored (${db.reports.length})`);
  }

  // 7. Audit Logs
  if (db.auditLogs && db.auditLogs.length > 0) {
    for (const item of db.auditLogs) {
      await prisma.auditLog.upsert({
        where: { id: item.id },
        update: { ...item, createdAt: new Date(item.createdAt) },
        create: { ...item, createdAt: new Date(item.createdAt) },
      });
    }
    console.log(`✅ Audit Logs restored (${db.auditLogs.length})`);
  }

  console.log('🎉 Database seeding and restoration completed successfully!');
}

seedRestore()
  .catch((e) => {
    console.error('❌ Restore error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
