import { readOne } from '@/lib/db/read-list'

export const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export function pageId(tenant: string, path: string): string {
  const slug = path.replace(/^\/+/, '').replace(/[^a-z0-9]+/gi, '_')
  return `page_${tenant}_${slug.length > 0 ? slug : 'home'}`
}

export interface PathOwner {
  id: string
  packageId?: string
  component?: string
}

/** The single row that owns this path, if there is one. `path` is unique. */
export async function findRowForPath(
  tenant: string,
  path: string
): Promise<PathOwner | null> {
  try {
    const params = new URLSearchParams({ 'filter.path': path })
    const res = await fetch(
      `${DBAL}/${tenant}/core/PageConfig?${params.toString()}`,
      {
        signal: AbortSignal.timeout(6000),
      }
    )
    if (!res.ok) return null
    const json = (await res.json()) as {
      data?: { data?: Record<string, unknown>[] }
    }
    const row = readOne<Record<string, unknown>>(json)
    if (row === null) return null
    return {
      id: String(row.id),
      packageId: typeof row.packageId === 'string' ? row.packageId : undefined,
      component: typeof row.component === 'string' ? row.component : undefined,
    }
  } catch {
    // Fall through to a plain create rather than blocking on a failed lookup.
    return null
  }
}
