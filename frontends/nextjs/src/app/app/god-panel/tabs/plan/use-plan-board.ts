'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setPlan } from '@/store/slices/god-slice'

export type Status = 'todo' | 'doing' | 'done'
export interface Task { id: string; title: string; status: Status }

export const COLUMNS: Array<{ status: Status; label: string }> = [
  { status: 'todo', label: 'To do' },
  { status: 'doing', label: 'In progress' },
  { status: 'done', label: 'Done' },
]

const NEXT: Record<Status, Status> = { todo: 'doing', doing: 'done', done: 'todo' }
const PREV: Record<Status, Status> = { todo: 'done', doing: 'todo', done: 'doing' }

/** SDLC planning board (kanban), persisted in Redux god slice. */
export function usePlanBoard() {
  const dispatch = useAppDispatch()
  const tasks: Task[] = useAppSelector((s) => s.god.plan)
  const [draft, setDraft] = useState('')

  const persist = useCallback((next: Task[]) => { dispatch(setPlan(next)) }, [dispatch])

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
