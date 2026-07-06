'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCss, clearDirty } from '@/store/slices/god-slice'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface CssClass {
  id: string
  name: string
  props: Record<string, string>
}

/** Named CSS class registry (persisted in Redux god slice). */
export function useCssClasses() {
  const dispatch = useAppDispatch()
  const classes: CssClass[] = useAppSelector((s) => s.god.css)
  const dirty = useAppSelector((s) => s.god.dirty.css)
  const [publishing, setPublishing] = useState(false)

  const persist = useCallback((next: CssClass[]) => { dispatch(setCss(next)) }, [dispatch])

  const create = useCallback((name: string): string => {
    const id = `c_${Date.now()}`
    persist([...classes, { id, name: name.trim() || 'new-class', props: {} }])
    return id
  }, [classes, persist])

  const rename = useCallback((id: string, name: string) => {
    persist(classes.map((c) => c.id === id ? { ...c, name } : c))
  }, [classes, persist])

  const setProp = useCallback((id: string, key: string, value: string) => {
    persist(classes.map((c) => c.id === id ? { ...c, props: { ...c.props, [key]: value } } : c))
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
      dispatch(clearDirty('css')); return true
    } catch { return false } finally { setPublishing(false) }
  }, [classes, dispatch])

  return { classes, create, rename, setProp, removeProp, remove, dirty, publish, publishing }
}
