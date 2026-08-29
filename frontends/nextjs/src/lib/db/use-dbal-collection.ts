'use client'

/**
 * List/create/update/remove for one DBAL entity.
 *
 * usePageRoutes and useInstalledPackages were the same hook twice: the same
 * `{tenant}/{package}/{Entity}` base, the same load-on-mount plus a refresh
 * counter, the same POST/PUT/DELETE that throw `HTTP {status}`. They also
 * disagreed on how to read a list response, which is how one of them came to
 * return nothing at all against a real DBAL. One implementation cannot drift
 * from itself.
 */

import { useCallback, useEffect, useState } from 'react'

import { readList } from './read-list'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface DbalCollectionOptions {
  tenant: string
  /** DBAL package segment; almost always 'core'. */
  package?: string
  /** Entity name as the schema declares it, e.g. 'PageConfig'. */
  entity: string
  timeoutMs?: number
}

export interface DbalCollection<T> {
  items: T[]
  loading: boolean
  error: string | null
  reload: () => void
  create: (data: unknown) => Promise<void>
  update: (id: string, data: unknown) => Promise<void>
  remove: (id: string) => Promise<void>
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/** The server's own message where there is one, else the status. */
async function failure(res: Response): Promise<Error> {
  const text = await res.text().catch(() => '')
  return new Error(text.length > 0 ? text : `HTTP ${res.status}`)
}

export function useDbalCollection<T>(
  options: DbalCollectionOptions
): DbalCollection<T> {
  const { tenant, entity, timeoutMs = 8000 } = options
  const pkg = options.package ?? 'core'

  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const base = `${DBAL}/${tenant}/${pkg}/${entity}`

  const reload = useCallback(() => {
    setRefreshKey(key => key + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(base, {
          signal: AbortSignal.timeout(timeoutMs),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const raw: unknown = await res.json()
        if (cancelled) return
        setItems(readList<T>(raw))
        setError(null)
      } catch (cause: unknown) {
        if (cancelled) return
        setItems([])
        setError(cause instanceof Error ? cause.message : 'Load failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [base, refreshKey, timeoutMs])

  const write = useCallback(
    async (url: string, method: string, data?: unknown) => {
      const res = await fetch(url, {
        method,
        headers: data === undefined ? undefined : JSON_HEADERS,
        body: data === undefined ? undefined : JSON.stringify(data),
      })
      if (!res.ok) throw await failure(res)
      setRefreshKey(key => key + 1)
    },
    []
  )

  const create = useCallback(
    (data: unknown) => write(base, 'POST', data),
    [base, write]
  )
  const update = useCallback(
    (id: string, data: unknown) => write(`${base}/${id}`, 'PUT', data),
    [base, write]
  )
  const remove = useCallback(
    (id: string) => write(`${base}/${id}`, 'DELETE'),
    [base, write]
  )

  return { items, loading, error, reload, create, update, remove }
}
