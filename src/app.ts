import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./modules/auth/routes/auth.routes";
import userRouter from "./modules/user/routes/user.routes";
import adminRouter from "./modules/admin/routes/admin.routes";
import { globalErrorHandler } from "./utils/error-middleware";
import { apiLimiter } from "./shared/middleware/rateLimiter";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(apiLimiter);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    time: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);

app.use(globalErrorHandler);

export default app;
