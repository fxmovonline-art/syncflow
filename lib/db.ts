import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton for serverless environments (Vercel, AWS Lambda, etc.)
 * 
 * In serverless, each function invocation gets a new container, so we need to:
 * 1. Cache the client in globalThis during the function lifecycle
 * 2. Reuse connections across multiple invocations
 * 3. Prevent opening too many database connections
 */

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: 
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;
