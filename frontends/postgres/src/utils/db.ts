import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { adminUserSchema } from '@/models/Schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export { adminUserSchema };
