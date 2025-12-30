/**
 * Prisma v7 Configuration
 *
 * In Prisma v7, the datasource url is no longer in schema.prisma.
 * It must be configured here instead.
 * 
 * See: https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */
import { defineConfig } from 'prisma/config'
import path from 'node:path'

export default defineConfig({
  // Schema is in the repo root prisma/ directory
  schema: path.resolve(__dirname, '../../prisma/schema.prisma'),
  
  datasource: {
    // Use process.env directly with fallback for CI/CD environments where
    // prisma generate doesn't need a real database connection
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
})
