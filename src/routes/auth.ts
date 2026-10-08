import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.js";
import { loginRateLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", loginRateLimiter, login);
router.get("/me", requireAuth, me);
router.post("/logout", logout);

export default router;
