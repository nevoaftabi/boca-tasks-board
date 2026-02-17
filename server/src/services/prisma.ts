import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { DATABASE_URL } = process.env;

if(!DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
}

const prismaPg = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
});

export const prismaClient = new PrismaClient({
  adapter: prismaPg
});