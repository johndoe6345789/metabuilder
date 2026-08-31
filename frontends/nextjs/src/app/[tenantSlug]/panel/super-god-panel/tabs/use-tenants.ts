import { useState, useEffect } from 'react'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface Tenant {
  id: string
  name: string
  ownerId: string
  createdAt: number
  homepageConfig?: { pageId: string }
}

/** Tenant list plus create/delete, kept out of the tab so it only owns
 *  what to render. */
export function useTenants(ownerId: string | undefined) {
  const [tenants, setTenants] = useState<Tenant[]>([])

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/tenant`, {
      signal: AbortSignal.timeout(5000),
    })
      .then(res => (res.ok ? res.json() : null))
      .then((json: { data?: Tenant[] } | null) => {
        if (json?.data != null) setTenants(json.data)
      })
      .catch(() => {
        /* offline */
      })
  }, [])

  const create = (name: string) => {
    setTenants(prev => [
      ...prev,
      {
        id: `tenant_${Date.now()}`,
        name,
        ownerId: ownerId ?? 'unknown',
        createdAt: Date.now(),
      },
    ])
  }

  const remove = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id))
  }

  return { tenants, create, remove }
}
