'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCurrentTenantScope } from '../use-current-tenant-scope'
import type { Submission } from './submission-row'
import { fetchSubmissions, setSubmissionStatus } from './submissions-data'

export const HANDLED = 'handled'
export const NEW = 'new'

/** The inbox's state: what arrived, what is shown, and what was marked. */
export function useSubmissions() {
  // Scoped like every other God Panel tool: a founder reads their own
  // community's messages, never the instance's.
  const { tenant } = useCurrentTenantScope()
  const [rows, setRows] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markError, setMarkError] = useState<string | null>(null)
  const [form, setForm] = useState('')
  const [showHandled, setShowHandled] = useState(false)
  const [reloads, setReloads] = useState(0)

  // The spinner is turned on by whoever asks for a reload, not in the
  // effect body: a setState there cascades a render before the fetch has
  // even started, which the lint rule is about.
  useEffect(() => {
    let live = true
    fetchSubmissions(tenant)
      .then(found => {
        if (!live) return
        setRows(found)
        setError(null)
      })
      .catch((e: unknown) => {
        if (!live) return
        // An inbox that could not be read must not render as an empty
        // one: the rows go too, so nothing stale is shown beside the
        // message saying the read failed.
        setRows([])
        setError(e instanceof Error ? e.message : 'Could not read messages.')
      })
      .finally(() => {
        if (live) setLoading(false)
      })
    return () => {
      live = false
    }
  }, [tenant, reloads])

  const setStatusOf = useCallback((id: string, status: string) => {
    setRows(all => all.map(r => (r.id === id ? { ...r, status } : r)))
  }, [])

  const mark = useCallback(
    async (row: Submission, handled: boolean) => {
      const status = handled ? HANDLED : NEW
      const before = row.status
      setStatusOf(row.id, status)
      try {
        await setSubmissionStatus(tenant, row.id, status)
        setMarkError(null)
      } catch (e: unknown) {
        setStatusOf(row.id, before)
        const why = e instanceof Error ? e.message : 'the data layer refused'
        setMarkError(`Could not mark that message: ${why}`)
      }
    },
    [tenant, setStatusOf]
  )

  const forms = useMemo(
    () => [...new Set(rows.map(r => r.formName))].sort(),
    [rows]
  )
  const visible = useMemo(
    () =>
      rows.filter(
        r =>
          (form === '' || r.formName === form) &&
          (showHandled || r.status !== HANDLED)
      ),
    [rows, form, showHandled]
  )

  return {
    tenant,
    rows,
    visible,
    forms,
    loading,
    error,
    markError,
    form,
    setForm,
    showHandled,
    setShowHandled,
    mark,
    /** How many are still waiting, whatever the current filter shows. */
    waiting: useMemo(
      () => rows.filter(r => r.status !== HANDLED).length,
      [rows]
    ),
    refresh: useCallback(() => {
      setLoading(true)
      setReloads(n => n + 1)
    }, []),
  }
}
