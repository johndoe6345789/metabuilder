'use client'

import { useCallback, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCss, clearDirty, type GodState } from '@/store/slices/god-slice'
import { loadStyleClasses, saveStyleClasses } from '@/lib/tenant/style-classes'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface CssClass {
  id: string
  name: string
  props: Record<string, string>
}

/** Named CSS class registry (persisted in Redux god slice). */
export function useCssClasses() {
  const dispatch = useAppDispatch()
  const classes = useAppSelector(s => (s.god as GodState).css)
  const dirty = useAppSelector(s => (s.god as GodState).dirty.css)
  const [publishing, setPublishing] = useState(false)

  const persist = useCallback(
    (next: CssClass[]) => {
      dispatch(setCss(next))
    },
    [dispatch]
  )

  const create = useCallback(
    (name: string): string => {
      const id = `c_${Date.now()}`
      const trimmed = name.trim()
      persist([
        ...classes,
        { id, name: trimmed.length > 0 ? trimmed : 'new-class', props: {} },
      ])
      return id
    },
    [classes, persist]
  )

  const rename = useCallback(
    (id: string, name: string) => {
      persist(classes.map(c => (c.id === id ? { ...c, name } : c)))
    },
    [classes, persist]
  )

  const setProp = useCallback(
    (id: string, key: string, value: string) => {
      persist(
        classes.map(c =>
          c.id === id ? { ...c, props: { ...c.props, [key]: value } } : c
        )
      )
    },
    [classes, persist]
  )

  const removeProp = useCallback(
    (id: string, key: string) => {
      persist(
        classes.map(c => {
          if (c.id !== id) return c
          const next = { ...c.props }
          delete next[key]
          return { ...c, props: next }
        })
      )
    },
    [classes, persist]
  )

  const remove = useCallback(
    (id: string) => {
      persist(classes.filter(c => c.id !== id))
    },
    [classes, persist]
  )

  /**
   * Load the tenant's saved classes once, so the Styles tab and the builder's
   * class picker both start from what is actually published rather than an
   * empty list.
   */
  const loadedFor = useRef<string | null>(null)
  const hydrate = useCallback(
    (tenant: string) => {
      if (loadedFor.current === tenant) return
      loadedFor.current = tenant
      void loadStyleClasses(DBAL, tenant)
        .then(rows => {
          if (rows.length > 0) dispatch(setCss(rows))
        })
        .catch(() => null)
    },
    [dispatch]
  )

  const publish = useCallback(
    async (tenant = 'system'): Promise<boolean> => {
      setPublishing(true)
      try {
        // Rows, not a JSON blob: StyleClass.classes was dropped when the
        // schema went relational, so the old POST wrote a column that is no
        // longer there.
        const ok = await saveStyleClasses(DBAL, tenant, classes)
        if (!ok) return false
        dispatch(clearDirty('css'))
        return true
      } catch {
        return false
      } finally {
        setPublishing(false)
      }
    },
    [classes, dispatch]
  )

  return {
    classes,
    hydrate,
    create,
    rename,
    setProp,
    removeProp,
    remove,
    /** Swap in a whole class list computed elsewhere (BQL's `style`s). */
    replace: persist,
    dirty,
    publish,
    publishing,
  }
}
