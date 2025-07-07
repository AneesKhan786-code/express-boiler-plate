import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./modules/auth/routes/auth.routes";
import userRouter from "./modules/user/routes/user.routes";
import jobRouter from "./modules/jobs/routes/jobs.routes";
import expenseRouter from "./modules/expense/routes/expense.routes";
import { globalErrorHandler } from "./utils/error-middleware";
import adminRouter from "./modules/admin/routes/admin.routes";
import categoryRouter from "././modules/category/routes/category.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/expenses", expenseRouter);
app.use("/api/v1/categories", categoryRouter); // Public
app.use("/api/v1/admin", adminRouter); // Admin

app.use(globalErrorHandler);

export default app;

