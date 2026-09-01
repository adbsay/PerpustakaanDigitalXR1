import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:bnrgxplwzqp@localhost:5432/libra_db";
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function exportDatabase() {
  try {
    const db = {
      admins: await prisma.admin.findMany(),
      publishers: await prisma.publisher.findMany(),
      categories: await prisma.category.findMany(),
      books: await prisma.book.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
      announcements: await prisma.announcement.findMany(),
      reports: await prisma.report.findMany(),
    };
    
    fs.writeFileSync('prisma/database_backup.json', JSON.stringify(db, null, 2));
    console.log('✅ Database exported successfully to prisma/database_backup.json');
    console.log('Record counts:', {
      admins: db.admins.length,
      publishers: db.publishers.length,
      categories: db.categories.length,
      books: db.books.length,
      auditLogs: db.auditLogs.length,
      announcements: db.announcements.length,
      reports: db.reports.length
    });
  } catch (err) {
    console.error('❌ Error exporting database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

exportDatabase();
