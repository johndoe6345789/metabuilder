/** Where the bootstrap seeder writes. */

const DBAL_URL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  process.env.NEXT_PUBLIC_DBAL_API_URL ??
  'http://localhost:8080'

export const ENTITY_BASE = `${DBAL_URL}/system/core`
