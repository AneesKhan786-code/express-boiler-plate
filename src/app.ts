import express from "express";
import { authRouter } from "./modules/auth/routes/auth.routes";
import { globalErrorHandler } from "./utils/error-middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRouter);
app.use(globalErrorHandler);

export default app;
