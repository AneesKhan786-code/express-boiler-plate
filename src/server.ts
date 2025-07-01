import app from "./app";
import pool from "./adapters/postgres/postgres.adapter";

const PORT = 4000;

pool.connect()
  .then(() => {
    console.log(" PostgreSQL connected");
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error(" Failed to connect to PostgreSQL:", err.message);
    process.exit(1); 
  });