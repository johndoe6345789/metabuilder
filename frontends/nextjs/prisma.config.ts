/**
 * Prisma Configuration
 *
 * This file replaces the deprecated package.json#prisma configuration.
 * See: https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */
// Try to load dotenv, but don't fail if it's not available (e.g., in CI)
try {
  // @ts-ignore - dotenv might not be available
  await import('dotenv/config')
} catch {
  // Dotenv not available or failed - that's okay, DATABASE_URL might be set directly
}

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
