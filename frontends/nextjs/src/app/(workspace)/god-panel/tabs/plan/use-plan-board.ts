'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setPlan } from '@/store/slices/god-slice'
import { COLUMNS } from './plan-data'
import { addTask, moveTask, updateTask } from './plan-ops'
import type { NewTaskInput, Priority, Status, Task } from './plan-types'
import { normalizeTask } from './plan-utils'

export { COLUMNS }
export type { Priority, Status, Task }

export function usePlanBoard() {
  const dispatch = useAppDispatch()
  const rawTasks = useAppSelector((state): Task[] => {
    const god = (state as { god?: { plan?: Task[] } }).god
    return god?.plan ?? []
  })
  const tasks = rawTasks.map(task => normalizeTask(task))

  const persist = useCallback(
    (next: Task[]) => {
      dispatch(setPlan(next.map(normalizeTask)))
    },
    [dispatch]
  )

  const create = useCallback((input: NewTaskInput) => {
    let next = addTask(tasks, input.title, input.status)
    const created = next[next.length - 1]
    next = updateTask(next, created.id, input)
    persist(next)
    return created.id
  }, [tasks, persist])

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

  return { tasks, create, moveTo, update, remove, byStatus }
}
