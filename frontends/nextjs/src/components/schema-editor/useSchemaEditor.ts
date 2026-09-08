/**
 * useSchemaEditor — data-fetching and mutation hook.
 *
 * Strategy:
 *   1. Try DBAL at /system/core/entity_schema (tenantId = 'system').
 *   2. On failure fall back to localStorage key 'app-schemas-<tenantId>'.
 * Save always writes to localStorage; also POSTs/PUTs to DBAL when online.
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { readList } from '@/lib/db/read-list'
import type { ModelSchema } from './schema-types'

const DBAL_URL =
  typeof process !== 'undefined'
    ? (process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080')
    : 'http://localhost:8080'

function localKey(tenantId: string) {
  return `app-schemas-${tenantId}`
}

function readLocal(tenantId: string): ModelSchema[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(localKey(tenantId))
    return raw != null ? (JSON.parse(raw) as ModelSchema[]) : []
  } catch {
    return []
  }
}

function writeLocal(tenantId: string, models: ModelSchema[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(localKey(tenantId), JSON.stringify(models))
}

interface UseSchemaEditorResult {
  models: ModelSchema[]
  loading: boolean
  offline: boolean
  saveModels: (next: ModelSchema[]) => Promise<void>
}

export function useSchemaEditor(tenantId: string): UseSchemaEditorResult {
  const [models, setModels] = useState<ModelSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  // A tenant switch needs to show loading again before the refetch below
  // resolves. Adjusted during render (the documented React pattern for
  // state that tracks a prop) instead of synchronously inside the effect.
  const [prevTenantId, setPrevTenantId] = useState(tenantId)
  if (tenantId !== prevTenantId) {
    setPrevTenantId(tenantId)
    setLoading(true)
  }

  useEffect(() => {
    let cancelled = false

    fetch(`${DBAL_URL}/${tenantId}/core/entity_schema`, {
      signal: AbortSignal.timeout(4000),
    })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('not ok'))))
      .then((json: unknown) => {
        if (cancelled) return
        // readList, not `json.data`: the real envelope is
        // {data:{data:[…]}}, so this read an object, `.length > 0` was
        // undefined > 0 -- false -- and the editor quietly fell back to
        // the browser's own copy. A founder's saved models never loaded.
        const loaded = readList<ModelSchema>(json)
        setModels(loaded.length > 0 ? loaded : readLocal(tenantId))
        setOffline(false)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setModels(readLocal(tenantId))
        setOffline(true)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tenantId])

  const saveModels = useCallback(
    async (next: ModelSchema[]) => {
      writeLocal(tenantId, next)
      setModels(next)

      if (!offline) {
        try {
          const res = await fetch(
            `${DBAL_URL}/${tenantId}/core/entity_schema`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tenantId, data: next }),
              signal: AbortSignal.timeout(5000),
            }
          )
          // The response was never read, so a refusal looked exactly like
          // a save: the editor showed the new model and it existed only in
          // this browser. The badge already says "changes saved locally
          // only" -- it just was not being told.
          if (!res.ok) setOffline(true)
        } catch {
          // DBAL unavailable — localStorage is the source of truth, and
          // the badge should say so rather than implying it reached one.
          setOffline(true)
        }
      }
    },
    [tenantId, offline]
  )

  return { models, loading, offline, saveModels }
}
