import { afterAll } from "vitest";
import redis from "../src/redis.js";
import prisma from "../src/db.js";

await redis.connect();

afterAll(async () => {
  await redis.quit();
  await prisma.$disconnect();
});
