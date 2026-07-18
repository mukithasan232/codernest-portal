import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  try {
    await prisma.$connect();
    console.log("Connected successfully to server");
  } catch(e) {
    console.error("Connection failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
