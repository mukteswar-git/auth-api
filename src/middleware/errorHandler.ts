import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);

  if (err.message === "EMAIL_ALREADY_EXISTS") {
    return res.status(409).json({
      error: "Email already exists",
    });
  }

  if (err.message === "INVALID_CREDENTIALS") {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }

  return res.status(500).json({
    error: "Internal server error",
  });
}
