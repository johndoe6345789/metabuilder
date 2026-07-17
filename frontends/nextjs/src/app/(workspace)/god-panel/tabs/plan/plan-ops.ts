import type { Status, Task } from './plan-types'
import { normalizeTask, now, uid } from './plan-utils'

export function addTask(tasks: Task[], title: string, status: Status): Task[] {
  return [
    ...tasks,
    {
      id: uid(),
      title,
      status,
      labels: [],
      priority: 'medium',
      createdAt: now(),
      updatedAt: now(),
    },
  ]
}

export function moveTask(
  tasks: Task[],
  id: string,
  status: Status,
  targetId?: string
): Task[] {
  const dragged = tasks.find(task => task.id === id)
  if (dragged == null) return tasks
  const rest = tasks.filter(task => task.id !== id)
  const updated = { ...dragged, status, updatedAt: now() }
  if (targetId == null) return [...rest, updated]
  const index = rest.findIndex(task => task.id === targetId)
  if (index < 0) return [...rest, updated]
  return [...rest.slice(0, index), updated, ...rest.slice(index)]
}

export function updateTask(
  tasks: Task[],
  id: string,
  patch: Partial<Task>
): Task[] {
  return tasks.map(task =>
    task.id === id
      ? normalizeTask({ ...task, ...patch, updatedAt: now() })
      : task
  )
}
