const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clubs = await prisma.club.findMany();
  console.log(JSON.stringify(clubs, null, 2));
}

main().finally(() => prisma.$disconnect());
