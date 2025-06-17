import express from "express";
import { authRouter } from "./modules/auth/routes/auth.routes";
import { globalErrorHandler } from "./utils/error-middleware";
import pool from "./adapters/postgres/postgres.adapter"; // ✅ default import

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRouter);

app.use(globalErrorHandler);

const PORT = 4000;

pool
  .connect()

  .then(() => {
    console.log("✅ PostgreSQL connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running at port: ${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error(" Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
});