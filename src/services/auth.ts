import bcrypt from "bcrypt";
import { Prisma } from "../generated/prisma/client.js";
import prisma from "../db.js";
import { randomBytes } from "crypto";
import redis from "../redis.js";

export async function registerUser(
  email: string,
  password: string,
) {
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function loginUser(
  email: string,
  password: string,
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const sessionId = randomBytes(32).toString("hex");

  await redis.set(
    `session:${sessionId}`,
    user.id.toString(),
    {
      EX: 7 * 24 * 60 * 60,
    },
  );

  return sessionId;
}

export async function logoutUser(
  sessionId: string,
) {
  await redis.del(`session:${sessionId}`);
}
