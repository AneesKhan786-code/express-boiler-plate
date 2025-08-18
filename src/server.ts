// src/server.ts
import app from "./app";
import { db } from "./drizzle/db";
import { sql } from "drizzle-orm";

const PORT = 4000;

(async () => {
  try {
    await db.execute(sql`SELECT 1`);
    console.log(" PostgreSQL (Neon) connected");
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error(" Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }
})();
