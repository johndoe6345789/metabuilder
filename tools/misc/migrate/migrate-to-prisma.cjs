#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '../src/lib/database-prisma.ts');
const targetPath = path.join(__dirname, '../src/lib/database.ts');
const backupPath = path.join(__dirname, '../src/lib/database-kv-backup.ts');

console.log('Migrating database layer to Prisma...');

if (fs.existsSync(targetPath)) {
  console.log('Creating backup of old database.ts...');
  fs.copyFileSync(targetPath, backupPath);
  console.log(`Backup created at: ${backupPath}`);
}

console.log('Copying Prisma implementation...');
fs.copyFileSync(sourcePath, targetPath);
console.log('Database layer migrated successfully!');

console.log('\nNext steps:');
console.log('1. Run: npm run db:generate');
console.log('2. Run: npm run db:push');
console.log('3. Restart your development server');
