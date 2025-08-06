import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in the environment variables.");
}

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
