'use client'

import { useCallback, useEffect, useState } from 'react'
import { idbGet, idbSet } from '@/lib/persist/idb-kv'

const KEY = 'god.planBoard'

export type Status = 'todo' | 'doing' | 'done'
export interface Task { id: string; title: string; status: Status }

export const COLUMNS: Array<{ status: Status; label: string }> = [
  { status: 'todo', label: 'To do' },
  { status: 'doing', label: 'In progress' },
  { status: 'done', label: 'Done' },
]

const NEXT: Record<Status, Status> = { todo: 'doing', doing: 'done', done: 'todo' }
const PREV: Record<Status, Status> = { todo: 'done', doing: 'todo', done: 'doing' }

function seed(): Task[] {
  return [
    { id: 'p1', title: 'Design the landing page', status: 'todo' },
    { id: 'p2', title: 'Wire signup workflow', status: 'doing' },
  ]
}

/** Simple SDLC planning board (kanban), IndexedDB-persisted. */
export function usePlanBoard() {
  const [tasks, setTasks] = useState<Task[]>(seed)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    void idbGet<Task[]>(KEY).then((t) => { if (t) setTasks(t) })
  }, [])

  const persist = useCallback((next: Task[]) => {
    setTasks(next); void idbSet(KEY, next)
  }, [])

  const add = useCallback(() => {
    if (!draft.trim()) return
    persist([...tasks, { id: `p_${Date.now()}`, title: draft.trim(), status: 'todo' }])
    setDraft('')
  }, [draft, tasks, persist])

  const move = useCallback((id: string, dir: 1 | -1) => {
    persist(tasks.map((t) => t.id === id
      ? { ...t, status: dir === 1 ? NEXT[t.status] : PREV[t.status] } : t))
  }, [tasks, persist])

  const remove = useCallback((id: string) => {
    persist(tasks.filter((t) => t.id !== id))
  }, [tasks, persist])

  return { tasks, draft, setDraft, add, move, remove }
}
