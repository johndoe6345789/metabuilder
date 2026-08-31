export const DBAL_URL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  process.env.NEXT_PUBLIC_DBAL_API_URL ??
  'http://localhost:8080'

export const TENANT = process.env.DBAL_DEFAULT_TENANT ?? 'system'
export const PACKAGE = process.env.DBAL_DEFAULT_PACKAGE ?? 'core'
