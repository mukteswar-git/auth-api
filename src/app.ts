import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/auth.js";
import swaggerSpec from "./swagger.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use(errorHandler);

export default app;
