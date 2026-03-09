/**
 * DBAL HTTP Client
 *
 * Replaces flaskSync.ts — all sync operations now target the DBAL C++ daemon
 * instead of the Flask backend. Uses the DBAL REST API:
 *   /{tenant}/{package}/{entity}[/{id}]
 *
 * Admin endpoints (config, adapters, test-connection, seed) require
 * the DBAL_ADMIN_TOKEN bearer token.
 */

const DBAL_API_URL = process.env.NEXT_PUBLIC_DBAL_API_URL || 'http://localhost:8080'

/** Returns true for network-level failures (service unreachable, CORS, etc.).
 *  These are expected when the DBAL daemon is not running — warn, don't error. */
function isConnectionError(error: unknown): boolean {
  return error instanceof TypeError && (
    (error.message === 'Failed to fetch') ||
    (error.message === 'Load failed') || // Safari
    (error.message.startsWith('NetworkError'))
  )
}
const DBAL_TENANT = process.env.NEXT_PUBLIC_DBAL_TENANT || 'default'
/** Admin token — not prefixed with NEXT_PUBLIC_ to avoid client-side bundle exposure.
 *  Admin endpoints should be called from server-side API routes. */
const DBAL_ADMIN_TOKEN = process.env.DBAL_ADMIN_TOKEN || ''

/** Redux slice name → DBAL entity/package mapping */
const ENTITY_MAP: Record<string, { entity: string; package: string }> = {
  files: { entity: 'ProjectFile', package: 'codeforge' },
  models: { entity: 'ProjectModel', package: 'codeforge' },
  components: { entity: 'ComponentNode', package: 'codeforge' },
  componentTrees: { entity: 'ComponentTree', package: 'codeforge' },
  workflows: { entity: 'Workflow', package: 'core' },
  lambdas: { entity: 'Lambda', package: 'codeforge' },
  project: { entity: 'Project', package: 'codeforge' },
  projects: { entity: 'Project', package: 'codeforge' },
  settings: { entity: 'Settings', package: 'codeforge' },
  theme: { entity: 'Theme', package: 'codeforge' },
  kv: { entity: 'KVEntry', package: 'codeforge' },
  translations: { entity: 'Translation', package: 'core' },
}

function entityUrl(sliceName: string, id?: string): string {
  const mapping = ENTITY_MAP[sliceName]
  if (!mapping) throw new Error(`[DBALSync] Unknown slice: ${sliceName}`)
  const base = `${DBAL_API_URL}/${DBAL_TENANT}/${mapping.package}/${mapping.entity}`
  return id ? `${base}/${id}` : base
}

function adminUrl(path: string): string {
  return `${DBAL_API_URL}/admin/${path}`
}

function adminHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (DBAL_ADMIN_TOKEN) {
    headers['Authorization'] = `Bearer ${DBAL_ADMIN_TOKEN}`
  }
  return headers
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity CRUD
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Create or update a single entity record in DBAL */
export async function syncToDBAL(
  sliceName: string,
  id: string,
  data: any
): Promise<void> {
  try {
    const url = entityUrl(sliceName, id)
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id, tenantId: DBAL_TENANT }),
    })
    if (!response.ok) {
      throw new Error(`DBAL sync failed: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn('[DBALSync] DBAL not reachable — sync skipped')
    } else {
      console.error('[DBALSync] Error syncing to DBAL:', error)
    }
    throw error
  }
}

/** Create a new entity record in DBAL */
export async function createInDBAL(
  sliceName: string,
  data: any
): Promise<any> {
  try {
    const url = entityUrl(sliceName)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, tenantId: DBAL_TENANT }),
    })
    if (!response.ok) {
      throw new Error(`DBAL create failed: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn('[DBALSync] DBAL not reachable — create skipped')
    } else {
      console.error('[DBALSync] Error creating in DBAL:', error)
    }
    throw error
  }
}

/** Fetch a single entity record from DBAL */
export async function fetchFromDBAL(
  sliceName: string,
  id: string
): Promise<any | null> {
  try {
    const url = entityUrl(sliceName, id)
    const response = await fetch(url)
    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error(`DBAL fetch failed: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    if (!isConnectionError(error)) {
      console.error('[DBALSync] Error fetching from DBAL:', error)
    }
    return null
  }
}

/** List all entity records from DBAL */
export async function listFromDBAL(
  sliceName: string,
  params?: Record<string, string>
): Promise<any[]> {
  try {
    const url = new URL(entityUrl(sliceName))
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`DBAL list failed: ${response.status} ${response.statusText}`)
    }
    const result = await response.json()
    return Array.isArray(result) ? result : result.data ?? []
  } catch (error) {
    if (!isConnectionError(error)) {
      console.error('[DBALSync] Error listing from DBAL:', error)
    }
    return []
  }
}

/** Delete a single entity record from DBAL */
export async function deleteFromDBAL(
  sliceName: string,
  id: string
): Promise<void> {
  try {
    const url = entityUrl(sliceName, id)
    const response = await fetch(url, { method: 'DELETE' })
    if (!response.ok && response.status !== 404) {
      throw new Error(`DBAL delete failed: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn('[DBALSync] DBAL not reachable — delete skipped')
    } else {
      console.error('[DBALSync] Error deleting from DBAL:', error)
    }
    throw error
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bulk Operations
// ─────────────────────────────────────────────────────────────────────────────

/** Push all Redux state to DBAL (bulk POST per entity type) */
export async function syncAllToDBAL(
  data: Record<string, any[]>
): Promise<{ synced: number; failed: number }> {
  let synced = 0
  let failed = 0

  for (const [sliceName, records] of Object.entries(data)) {
    if (!ENTITY_MAP[sliceName]) continue

    for (const record of records) {
      try {
        const id = (record as any).id
        if (!id) continue
        await syncToDBAL(sliceName, id, record)
        synced++
      } catch {
        failed++
      }
    }
  }

  return { synced, failed }
}

/** Pull all entity data from DBAL into organized collections */
export async function fetchAllFromDBAL(): Promise<Record<string, any[]>> {
  const result: Record<string, any[]> = {}

  const entries = Object.entries(ENTITY_MAP)
  const settled = await Promise.allSettled(
    entries.map(([sliceName]) => listFromDBAL(sliceName))
  )

  for (let i = 0; i < entries.length; i++) {
    const [sliceName] = entries[i]
    const outcome = settled[i]
    result[sliceName] = outcome.status === 'fulfilled' ? outcome.value : []
  }

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Endpoints
// ─────────────────────────────────────────────────────────────────────────────

export interface DBALHealthResponse {
  status: string
  uptime_seconds?: number
  adapter?: string
}

/** GET /health — check if DBAL daemon is running */
export async function getDBALHealth(): Promise<DBALHealthResponse> {
  const response = await fetch(`${DBAL_API_URL}/health`)
  if (!response.ok) {
    throw new Error(`DBAL health check failed: ${response.status}`)
  }
  return await response.json()
}

export interface DBALConfigResponse {
  adapter: string
  database_url: string
  status: string
  [key: string]: unknown
}

/** GET /admin/config — get current DBAL configuration */
export async function getDBALConfig(): Promise<DBALConfigResponse> {
  const response = await fetch(adminUrl('config'), { headers: adminHeaders() })
  if (!response.ok) {
    throw new Error(`DBAL config fetch failed: ${response.status}`)
  }
  const data = await response.json()
  return data.data ?? data
}

export interface DBALAdapterInfo {
  name: string
  description: string
  supported: boolean
  active: boolean
}

/** GET /admin/adapters — list available database adapters */
export async function getDBALAdapters(): Promise<DBALAdapterInfo[]> {
  const response = await fetch(adminUrl('adapters'), { headers: adminHeaders() })
  if (!response.ok) {
    throw new Error(`DBAL adapters fetch failed: ${response.status}`)
  }
  const data = await response.json()
  return data.data ?? []
}

/** POST /admin/test-connection — test a database connection without switching */
export async function testDBALConnection(
  adapter: string,
  databaseUrl: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(adminUrl('test-connection'), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ adapter, database_url: databaseUrl }),
  })
  return await response.json()
}

/** POST /admin/config — switch the active database adapter */
export async function switchDBALAdapter(
  adapter: string,
  databaseUrl: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(adminUrl('config'), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ adapter, database_url: databaseUrl }),
  })
  return await response.json()
}

export interface DBALSeedResult {
  success: boolean
  totalInserted: number
  totalSkipped: number
  totalFailed: number
  results: Array<{
    entity: string
    inserted: number
    skipped: number
    failed: number
    errors: string[]
  }>
  errors: string[]
}

/** POST /admin/seed — load seed data into the database */
export async function seedDBAL(
  force?: boolean,
  seedDir?: string
): Promise<DBALSeedResult> {
  const body: Record<string, unknown> = {}
  if (force !== undefined) body.force = force
  if (seedDir) body.seed_dir = seedDir

  const response = await fetch(adminUrl('seed'), {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`DBAL seed failed: ${response.status}`)
  }
  return await response.json()
}

/** Exported for consumers that need the entity mapping */
export { ENTITY_MAP }
