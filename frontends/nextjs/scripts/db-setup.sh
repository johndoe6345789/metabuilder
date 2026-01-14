#!/bin/bash
# Database setup script for development and testing

set -e

DB_FILE="../../prisma/prisma/dev.db"

# Generate Prisma client
echo "Generating Prisma client..."
npm run db:generate

# Push schema to database using proper environment configuration
echo "Creating database schema..."
cd ../../prisma
export DATABASE_URL="file:prisma/dev.db"

# Use npx to run prisma with proper env var
npx prisma db push --skip-generate

echo "Database setup complete"
