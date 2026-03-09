/**
 * Server-Side DBAL Client (plain fetch)
 *
 * Minimal fetch wrapper for API routes and server-side code ONLY.
 * Client components must use the Redux useDBAL hook from @metabuilder/api-clients,
 * which calls the C++ daemon directly via NEXT_PUBLIC_DBAL_API_URL.
 *
 * Usage:
 *   import { db } from '@/lib/db-client'
 *   const users = await db.users.list()
 *   const user = await db.users.read('user-123')
 */

import 'server-only'

const DBAL_URL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  process.env.NEXT_PUBLIC_DBAL_API_URL ??
  'http://localhost:8080'

const TENANT = process.env.DBAL_DEFAULT_TENANT ?? 'system'
const PACKAGE = process.env.DBAL_DEFAULT_PACKAGE ?? 'core'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ListResult<T = Record<string, unknown>> {
  data: T[]
  total?: number
}

export interface ListOptions {
  filter?: Record<string, unknown>
  limit?: number
  offset?: number
}

export interface EntityOps {
  list(options?: ListOptions): Promise<ListResult>
  read(id: string): Promise<Record<string, unknown> | null>
  create(data: Record<string, unknown>): Promise<Record<string, unknown>>
  update(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>>
  remove(id: string): Promise<boolean>
}

export interface DBALClient {
  users: EntityOps
  sessions: EntityOps
  workflows: EntityOps
  packages: EntityOps
  packageData: EntityOps
  pageConfigs: EntityOps
  installedPackages: EntityOps
  credentials: EntityOps
  entity(name: string): EntityOps
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

async function dbalFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`DBAL ${res.status}: ${body}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/**
 * Unwrap C++ DBAL envelope: { data: ..., success: bool }
 */
function unwrap<T>(raw: unknown): T {
  if (raw !== null && typeof raw === 'object' && 'success' in (raw as Record<string, unknown>)) {
    return (raw as Record<string, unknown>).data as T
  }
  return raw as T
}

// ---------------------------------------------------------------------------
// Entity operations factory
// ---------------------------------------------------------------------------

function toEntityName(camelCase: string): string {
  let name = camelCase
  if (name.endsWith('s') && !name.endsWith('ss')) {
    name = name.slice(0, -1)
  }
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function createOps(entityName: string): EntityOps {
  const base = `${DBAL_URL}/${TENANT}/${PACKAGE}/${entityName}`

  return {
    async list(options?: ListOptions): Promise<ListResult> {
      const params = new URLSearchParams()
      if (options?.filter) {
        for (const [k, v] of Object.entries(options.filter)) {
          if (v !== undefined && v !== null) params.set(k, String(v as string | number | boolean))
        }
      }
      if (options?.limit !== undefined) params.set('_limit', String(options.limit))
      if (options?.offset !== undefined) params.set('_offset', String(options.offset))

      const qs = params.toString()
      const url = qs ? `${base}?${qs}` : base

      try {
        const raw = await dbalFetch<unknown>(url)
        const payload = unwrap<Record<string, unknown>>(raw)

        if (Array.isArray(payload)) {
          return { data: payload, total: payload.length }
        }
        if (payload && Array.isArray(payload.data)) {
          return { data: payload.data as Record<string, unknown>[], total: payload.total as number | undefined }
        }
        return { data: [] }
      } catch {
        return { data: [] }
      }
    },

    async read(id: string): Promise<Record<string, unknown> | null> {
      try {
        const raw = await dbalFetch<unknown>(`${base}/${id}`)
        return unwrap<Record<string, unknown>>(raw)
      } catch {
        return null
      }
    },

    async create(data: Record<string, unknown>): Promise<Record<string, unknown>> {
      const raw = await dbalFetch<unknown>(base, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return unwrap<Record<string, unknown>>(raw)
    },

    async update(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
      const raw = await dbalFetch<unknown>(`${base}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return unwrap<Record<string, unknown>>(raw)
    },

    async remove(id: string): Promise<boolean> {
      try {
        await dbalFetch<void>(`${base}/${id}`, { method: 'DELETE' })
        return true
      } catch {
        return false
      }
    },
  }
}

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

const cache = new Map<string, EntityOps>()

function getOps(name: string): EntityOps {
  const entity = toEntityName(name)
  let ops = cache.get(entity)
  if (!ops) {
    ops = createOps(entity)
    cache.set(entity, ops)
  }
  return ops
}

export const db: DBALClient = new Proxy({} as DBALClient, {
  get(_target, prop: string | symbol) {
    if (typeof prop === 'symbol') return undefined
    if (prop === 'entity') return (name: string) => createOps(name)
    return getOps(prop)
  },
})

export function getDB(): DBALClient {
  return db
}

