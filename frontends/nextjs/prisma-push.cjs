const { execSync } = require('child_process');
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
execSync('npx prisma db push --schema=../../dbal/shared/prisma/schema.prisma', { stdio: 'inherit' });
