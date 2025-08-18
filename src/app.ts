import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import 'module-alias/register';
import baseRouter from "./modules/user/routes/base.routes";
import { authRouter } from "./modules/auth/routes/auth.routes";
import userRouter from "./modules/user/routes/user.routes";
import adminRouter from "./modules/admin/routes/admin.routes";
import { globalErrorHandler } from "./utils/error-middleware";
import { apiLimiter } from "./shared/middleware/rateLimiter";

const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(apiLimiter);

app.use("/api/v1", baseRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);

app.use(globalErrorHandler);

export default app;