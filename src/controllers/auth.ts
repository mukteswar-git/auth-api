import type { Request, Response, NextFunction } from "express";
import { registerSchema } from "../validators/auth.js";
import { registerUser } from "../services/auth.js";
import { loginSchema } from "../validators/auth.js";
import { loginUser } from "../services/auth.js";
import { logoutUser } from "../services/auth.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues,
    });
  }

  const { email, password } = result.data;

  try {
    const user = await registerUser(email, password);

    return res.status(201).json(user);
  } catch (error) {
      next(error);   
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues,
    });
  }

  const { email, password } = result.data;

  try {
    const sessionId = await loginUser(email, password);
    const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
    });

    return res.status(200).json({
      success: "Ok",
    });
  } catch (error) {
      next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
) {
  const user = req.user!;

  return res.json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  });
}

export async function logout(
  req: Request,
  res: Response,
) {
  const sessionId = req.cookies.sessionId;

  if (sessionId) {
    await logoutUser(sessionId);
  }

  res.clearCookie("sessionId");

  return res.json({
    success: "Logged out",
  });
}
