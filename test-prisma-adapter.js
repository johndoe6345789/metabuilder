// Test script to debug Prisma adapter initialization
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

console.log('Testing Prisma adapter initialization...\n');

// Test 1: Direct database path
console.log('Test 1: Using direct path');
try {
  const dbPath1 = './prisma/prisma/dev.db';
  console.log(`  Database path: ${dbPath1}`);
  const db1 = new Database(dbPath1);
  console.log('  ✓ Database opened successfully');
  const adapter1 = new PrismaBetterSqlite3(db1);
  console.log('  ✓ Adapter created successfully');
  const prisma1 = new PrismaClient({ adapter: adapter1 });
  console.log('  ✓ PrismaClient created successfully');
  
  // Try a simple query
  prisma1.user.findMany().then(users => {
    console.log(`  ✓ Query successful, found ${users.length} users`);
    prisma1.$disconnect();
  }).catch(err => {
    console.log(`  ✗ Query failed: ${err.message}`);
    prisma1.$disconnect();
  });
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
  console.log(`  Stack: ${error.stack}`);
}

// Test 2: Using environment variable style path
console.log('\nTest 2: Using file: prefix');
try {
  const databaseUrl = 'file:./prisma/prisma/dev.db';
  const dbPath2 = databaseUrl.replace('file:', '');
  console.log(`  Database URL: ${databaseUrl}`);
  console.log(`  Resolved path: ${dbPath2}`);
  const db2 = new Database(dbPath2);
  console.log('  ✓ Database opened successfully');
  const adapter2 = new PrismaBetterSqlite3(db2);
  console.log('  ✓ Adapter created successfully');
  const prisma2 = new PrismaClient({ adapter: adapter2 });
  console.log('  ✓ PrismaClient created successfully');
  
  // Try a simple query
  prisma2.user.count().then(count => {
    console.log(`  ✓ Count query successful, ${count} users total`);
    prisma2.$disconnect();
  }).catch(err => {
    console.log(`  ✗ Query failed: ${err.message}`);
    prisma2.$disconnect();
  });
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
  console.log(`  Stack: ${error.stack}`);
}

// Test 3: Check what happens with undefined
console.log('\nTest 3: Testing undefined handling');
try {
  const databaseUrl = undefined;
  const dbPath3 = databaseUrl?.replace('file:', '') || './prisma/prisma/dev.db';
  console.log(`  Database URL: ${databaseUrl}`);
  console.log(`  Resolved path: ${dbPath3}`);
  const db3 = new Database(dbPath3);
  console.log('  ✓ Database opened successfully');
  const adapter3 = new PrismaBetterSqlite3(db3);
  console.log('  ✓ Adapter created successfully');
  const prisma3 = new PrismaClient({ adapter: adapter3 });
  console.log('  ✓ PrismaClient created successfully');
  prisma3.$disconnect();
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
  console.log(`  Stack: ${error.stack}`);
}

console.log('\nAll tests completed!');
