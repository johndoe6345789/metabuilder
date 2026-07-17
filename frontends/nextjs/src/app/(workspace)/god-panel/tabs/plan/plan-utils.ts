import type { Task } from './plan-types'

export const now = () => new Date().toISOString()

export const uid = () =>
  `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

export function normalizeTask(task: Task): Task {
  return {
    ...task,
    labels: task.labels ?? [],
    priority: task.priority ?? 'medium',
    createdAt: task.createdAt ?? now(),
    updatedAt: task.updatedAt ?? task.createdAt ?? now(),
  }
}
