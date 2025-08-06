import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './index';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in the environment variables.');
}

const pool = new Pool({
  connectionString: connectionString,
});

export const db = drizzle(pool, { schema });