import express from "express";
import { authRouter } from "./modules/auth/routes/auth.routes";
import { expenseRouter } from "./modules/expense/routes/expense.routes";
import { globalErrorHandler } from "./utils/error-middleware";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); //  Needed for refresh token

// ROUTES
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/expense", expenseRouter);

// ERROR HANDLER
app.use(globalErrorHandler);

export default app;
