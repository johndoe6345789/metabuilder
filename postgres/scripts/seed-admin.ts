import * as bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { adminUserSchema } from '../src/models/Schema';
import { generateSecurePassword } from './generate-password';

async function seedAdminUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  const username = process.env.ADMIN_USERNAME || 'admin';

  // Generate secure password if not provided
  let password = process.env.ADMIN_PASSWORD;
  let passwordGenerated = false;

  if (!password) {
    password = generateSecurePassword(32);
    passwordGenerated = true;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.insert(adminUserSchema).values({
      username,
      passwordHash,
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Username: ${username}`);
    console.log(`🔑 Password: ${password}`);
    if (passwordGenerated) {
      console.log('⚠️  This password was auto-generated. Save it securely!');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 Login at: http://localhost:3000/admin/login');
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('ℹ️  Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  } finally {
    await pool.end();
  }
}

seedAdminUser();
