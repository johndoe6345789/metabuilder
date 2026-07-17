'use client'

import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setPlan } from '@/store/slices/god-slice'
import { COLUMNS } from './plan-data'
import { addTask, moveTask, updateTask } from './plan-ops'
import type { Priority, Status, Task } from './plan-types'
import { normalizeTask } from './plan-utils'

export { COLUMNS }
export type { Priority, Status, Task }

const initialDrafts = Object.fromEntries(
  COLUMNS.map(column => [column.status, ''])
) as Record<Status, string>

export function usePlanBoard() {
  const dispatch = useAppDispatch()
  const rawTasks = useAppSelector((state): Task[] => {
    const god = (state as { god?: { plan?: Task[] } }).god
    return god?.plan ?? []
  })
  const tasks = rawTasks.map(task => normalizeTask(task))
  const [drafts, setDrafts] = useState(initialDrafts)

  const persist = useCallback(
    (next: Task[]) => {
      dispatch(setPlan(next.map(normalizeTask)))
    },
    [dispatch]
  )

  const setDraft = useCallback((status: Status, value: string) => {
    setDrafts(current => ({ ...current, [status]: value }))
  }, [])

  const add = useCallback(
    (status: Status) => {
      const title = drafts[status].trim()
      if (title.length === 0) return
      persist(addTask(tasks, title, status))
      setDraft(status, '')
    },
    [drafts, tasks, persist, setDraft]
  )

  const moveTo = useCallback(
    (id: string, status: Status, targetId?: string) => {
      persist(moveTask(tasks, id, status, targetId))
    },
    [tasks, persist]
  )

  const update = useCallback(
    (id: string, patch: Partial<Task>) => {
      persist(updateTask(tasks, id, patch))
    },
    [tasks, persist]
  )

  const remove = useCallback(
    (id: string) => {
      persist(tasks.filter(task => task.id !== id))
    },
    [tasks, persist]
  )

  const byStatus = useCallback(
    (status: Status) => tasks.filter(task => task.status === status),
    [tasks]
  )

  return { tasks, drafts, setDraft, add, moveTo, update, remove, byStatus }
}
