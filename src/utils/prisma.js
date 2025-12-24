import { PrismaClient } from "@prisma/client";

// No options — Prisma v7 reads DATABASE_URL automatically
const prisma = new PrismaClient();

export default prisma;
