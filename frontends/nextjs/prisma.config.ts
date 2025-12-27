/**
 * Prisma Configuration
 *
 * This file replaces the deprecated package.json#prisma configuration.
 * See: https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */
import { defineConfig } from '@prisma/config'

export default defineConfig({
  // Schema is in the repo root prisma/ directory
  schema: '../../prisma/schema.prisma',

  migrations: {
    path: '../../prisma/migrations',
  },

  datasource: {
    // Use process.env directly to avoid errors when DATABASE_URL is not set
    // (e.g., during `prisma generate` in CI where DB isn't needed)
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
})
