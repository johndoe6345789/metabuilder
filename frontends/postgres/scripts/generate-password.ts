#!/usr/bin/env node

import * as crypto from 'node:crypto';

/**
 * Generate a secure random password
 * @param length - Length of the password (default: 32)
 * @param includeSpecial - Include special characters (default: true)
 */
function generateSecurePassword(length = 32, includeSpecial = true): string {
  let charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  if (includeSpecial) {
    charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';
  }

  let password = '';

  for (let i = 0; i < length; i++) {
    // Use crypto.randomInt() for unbiased random selection
    // This avoids modulo bias that occurs with randomBytes % charset.length
    const randomIndex = crypto.randomInt(charset.length);
    password += charset[randomIndex];
  }

  return password;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const length = args[0] ? Number.parseInt(args[0], 10) : 32;
  const includeSpecial = args[1] !== 'false';

  if (Number.isNaN(length) || length < 8) {
    console.error('Error: Password length must be at least 8 characters');
    process.exit(1);
  }

  if (length > 128) {
    console.error('Error: Password length cannot exceed 128 characters');
    process.exit(1);
  }

  const password = generateSecurePassword(length, includeSpecial);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Secure Password Generated');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Password: ${password}`);
  console.log(`Length: ${password.length} characters`);
  console.log(`Special characters: ${includeSpecial ? 'Yes' : 'No'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  Save this password securely!');
  console.log('');
  console.log('💡 Usage examples:');
  console.log(`   ADMIN_PASSWORD="${password}" npm run db:seed-admin`);
  console.log(`   export JWT_SECRET="${password}"`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

export { generateSecurePassword };
