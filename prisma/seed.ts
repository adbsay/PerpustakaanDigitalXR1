import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const categories = ["Fiksi","Non-Fiksi","Pendidikan","Sains & Teknologi","Bisnis & Ekonomi","Sejarah","Agama & Spiritualitas","Kesehatan","Seni & Budaya","Hukum","Politik","Psikologi","Filsafat","Biografi","Anak-anak"];
  for (const name of categories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log("Categories seeded");
}
main().catch(console.error).finally(() => prisma.$disconnect());
