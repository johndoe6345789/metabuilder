import 'server-only'

import { loadTree } from '@/lib/tenant/page-tree'

const DBAL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  process.env.NEXT_PUBLIC_DBAL_API_URL ??
  'http://localhost:8080'

export interface TenantPage {
  id: string
  path: string
  title: string
  level: number
  requiresAuth: boolean
  requiredRole: string | null
  /** Resolved from PageTreeNode/PageTreeProp; null until hydrated. */
  componentTree: unknown
  /** The tree this page renders, if any. */
  pageTreeId: string | null
  isActive: boolean
  tenantId?: string | null
  packageId?: string | null
  description?: string | null
}

export async function fetchTenantPage(
  tenant: string,
  path: string
): Promise<TenantPage | null> {
  try {
    const params = new URLSearchParams({
      'filter.path': path,
    })
    const url = `${DBAL}/${tenant}/core/PageConfig?${params.toString()}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const raw = (await res.json()) as unknown
    const arr = extractArray(unwrap(raw))
    const first = arr.find(page => {
      const active =
        (page.isActive as boolean | undefined) ??
        (page.isPublished as boolean | undefined) ??
        true
      return active === true
    })
    if (first === undefined) return null
    const page = normalize(first)
    if (page.pageTreeId !== null) {
      page.componentTree = await loadTree(DBAL, tenant, page.pageTreeId)
    }
    return page
  } catch {
    return null
  }
}

export async function fetchTenantPages(tenant: string): Promise<TenantPage[]> {
  try {
    const url = `${DBAL}/${tenant}/core/PageConfig`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    const raw = (await res.json()) as unknown
    return extractArray(unwrap(raw)).map(normalize)
  } catch {
    return []
  }
}

function unwrap(raw: unknown): unknown {
  if (raw !== null && typeof raw === 'object') {
    const envelope = raw as Record<string, unknown>
    if ('success' in envelope && 'data' in envelope) {
      return envelope.data
    }
  }
  return raw
}

function extractArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[]
  if (raw !== null && typeof raw === 'object') {
    const r = raw as Record<string, unknown>
    if (Array.isArray(r.data)) {
      return r.data as Record<string, unknown>[]
    }
  }
  return []
}

function normalize(p: Record<string, unknown>): TenantPage {
  return {
    id: p.id as string,
    path: p.path as string,
    title: p.title as string,
    level: (p.level as number | undefined) ?? 1,
    requiresAuth: (p.requiresAuth as boolean | undefined) ?? false,
    requiredRole: (p.requiredRole as string | null | undefined) ?? null,
    pageTreeId: (p.pageTreeId as string | null | undefined) ?? null,
    componentTree: null,
    isActive:
      (p.isActive as boolean | undefined) ??
      (p.isPublished as boolean | undefined) ??
      true,
    tenantId: p.tenantId as string | null | undefined,
    packageId: p.packageId as string | null | undefined,
    description: p.description as string | null | undefined,
  }
}
