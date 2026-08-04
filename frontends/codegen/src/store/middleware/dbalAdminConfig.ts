/**
 * DBAL admin config, health, adapters, and seed endpoints.
 * Interfaces: dbalAdminTypes.ts
 *
 * Goes through this app's own /api/dbal-admin/* proxy (server-side,
 * verifies the caller's own SSO token carries an admin role, then uses
 * the real DBAL_ADMIN_TOKEN) rather than calling DBAL's /admin/*
 * endpoints directly -- see src/lib/adminAuth.ts for why.
 */
import { getAuthToken } from '@metabuilder/dbal-sso/core'
import { DBAL_API_URL } from './dbalConfig'

function adminProxyUrl(path: string): string {
  return `/codegen/api/dbal-admin/${path}`
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export type {
  DBALHealthResponse,
  DBALConfigResponse,
  DBALAdapterInfo,
  DBALSeedResult,
} from './dbalAdminTypes'

export async function getDBALHealth() {
  const response = await fetch(`${DBAL_API_URL}/health`)
  if (!response.ok) throw new Error(
    `DBAL health check failed: ${response.status}`,
  )
  return response.json()
}

export async function getDBALConfig() {
  const response = await fetch(
    adminProxyUrl('config'), { headers: authHeaders() },
  )
  if (!response.ok) throw new Error(
    `DBAL config fetch failed: ${response.status}`,
  )
  const data = await response.json()
  return data.data ?? data
}

export async function getDBALAdapters() {
  const response = await fetch(
    adminProxyUrl('adapters'), { headers: authHeaders() },
  )
  if (!response.ok) throw new Error(
    `DBAL adapters fetch failed: ${response.status}`,
  )
  const data = await response.json()
  return data.data ?? []
}

export async function testDBALConnection(
  adapter: string, databaseUrl: string,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(adminProxyUrl('test-connection'), {
    method: 'POST', headers: authHeaders(),
    body: JSON.stringify({
      adapter, database_url: databaseUrl,
    }),
  })
  return response.json()
}

export async function switchDBALAdapter(
  adapter: string, databaseUrl: string,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(adminProxyUrl('config'), {
    method: 'POST', headers: authHeaders(),
    body: JSON.stringify({
      adapter, database_url: databaseUrl,
    }),
  })
  return response.json()
}

export async function seedDBAL(
  force?: boolean, seedDir?: string,
) {
  const body: Record<string, unknown> = {}
  if (force !== undefined) body.force = force
  if (seedDir) body.seed_dir = seedDir
  const response = await fetch(adminProxyUrl('seed'), {
    method: 'POST', headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(
    `DBAL seed failed: ${response.status}`,
  )
  return response.json()
}
