'use client'

import { useCallback, useEffect, useState } from 'react'
import { idbGet, idbSet } from '@/lib/persist/idb-kv'

const KEY = 'god.cssClasses'
const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface CssClass {
  id: string
  name: string
  props: Record<string, string>
}

function seed(): CssClass[] {
  return [
    { id: 'c_card', name: 'card', props: {
      padding: '16px', 'border-radius': '12px', background: '#161b22',
      border: '1px solid #30363d',
    } },
    { id: 'c_pill', name: 'pill', props: {
      padding: '4px 12px', 'border-radius': '999px', background: '#1f6feb', color: '#fff',
      'font-size': '12px', 'font-weight': '600',
    } },
  ]
}

/** Named CSS class registry with IndexedDB persistence + stage→publish. */
export function useCssClasses() {
  const [classes, setClasses] = useState<CssClass[]>(seed)
  const [dirty, setDirty] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    void idbGet<CssClass[]>(KEY).then((c) => { if (c && c.length) setClasses(c) })
  }, [])

  const persist = useCallback((next: CssClass[]) => {
    setClasses(next); setDirty(true); void idbSet(KEY, next)
  }, [])

  const create = useCallback((name: string): string => {
    const id = `c_${Date.now()}`
    persist([...classes, { id, name: name.trim() || 'new-class', props: {} }])
    return id
  }, [classes, persist])

  const rename = useCallback((id: string, name: string) => {
    persist(classes.map((c) => c.id === id ? { ...c, name } : c))
  }, [classes, persist])

  const setProp = useCallback((id: string, key: string, value: string) => {
    persist(classes.map((c) => c.id === id
      ? { ...c, props: { ...c.props, [key]: value } } : c))
  }, [classes, persist])

  const removeProp = useCallback((id: string, key: string) => {
    persist(classes.map((c) => {
      if (c.id !== id) return c
      const next = { ...c.props }; delete next[key]
      return { ...c, props: next }
    }))
  }, [classes, persist])

  const remove = useCallback((id: string) => {
    persist(classes.filter((c) => c.id !== id))
  }, [classes, persist])

  const publish = useCallback(async (tenant = 'system'): Promise<boolean> => {
    setPublishing(true)
    try {
      const res = await fetch(`${DBAL}/${tenant}/core/StyleClass`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant, classes }),
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) return false
      setDirty(false); return true
    } catch { return false } finally { setPublishing(false) }
  }, [classes])

  return { classes, create, rename, setProp, removeProp, remove, dirty, publish, publishing }
}
