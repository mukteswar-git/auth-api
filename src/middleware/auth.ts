import type {
  Request,
  Response,
  NextFunction,
} from "express";
import prisma from "../db.js";
import redis from "../redis.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  const userId = await redis.get(`session:${sessionId}`);

  if (!userId) {
    return res.status(401).json({
      error: "Invalid session",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    return res.status(401).json({
      error: "User not found",
    });
  }

  req.user = user;

  next();
}
