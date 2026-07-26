export type Status = 'todo' | 'doing' | 'done'
export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  status: Status
  description?: string
  labels?: string[]
  priority?: Priority
  assignee?: string
  createdAt?: string
  updatedAt?: string
}

export type NewTaskInput = Pick<
  Task,
  'title' | 'status' | 'priority' | 'description' | 'labels'
>

export interface ColumnDef {
  status: Status
  label: string
  hint: string
}
