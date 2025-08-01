import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import baseRouter from "./modules/user/routes/base.routes"; // ✅ new
import { authRouter } from "./modules/auth/routes/auth.routes";
import userRouter from "./modules/user/routes/user.routes";
import adminRouter from "./modules/admin/routes/admin.routes";
import { globalErrorHandler } from "./utils/error-middleware";
import { apiLimiter } from "./shared/middleware/rateLimiter";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(apiLimiter);

app.use("/api/v1", baseRouter);         // now ping is at /api/v1/
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);

app.use(globalErrorHandler);

export default app;
