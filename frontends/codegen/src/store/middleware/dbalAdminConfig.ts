/**
 * DBAL admin config, health, adapters, and seed endpoints.
 * Interfaces: dbalAdminTypes.ts
 */
import { adminUrl, adminHeaders, DBAL_API_URL } from './dbalConfig'
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
    adminUrl('config'), { headers: adminHeaders() },
  )
  if (!response.ok) throw new Error(
    `DBAL config fetch failed: ${response.status}`,
  )
  const data = await response.json()
  return data.data ?? data
}

export async function getDBALAdapters() {
  const response = await fetch(
    adminUrl('adapters'), { headers: adminHeaders() },
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
  const response = await fetch(adminUrl('test-connection'), {
    method: 'POST', headers: adminHeaders(),
    body: JSON.stringify({
      adapter, database_url: databaseUrl,
    }),
  })
  return response.json()
}

export async function switchDBALAdapter(
  adapter: string, databaseUrl: string,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(adminUrl('config'), {
    method: 'POST', headers: adminHeaders(),
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
  const response = await fetch(adminUrl('seed'), {
    method: 'POST', headers: adminHeaders(),
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(
    `DBAL seed failed: ${response.status}`,
  )
  return response.json()
}
