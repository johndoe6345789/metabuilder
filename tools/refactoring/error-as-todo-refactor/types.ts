export type TodoCategory =
  | 'parse_error'
  | 'type_error'
  | 'import_error'
  | 'test_failure'
  | 'lint_warning'
  | 'manual_fix_needed'
  | 'success'

export type TodoSeverity = 'high' | 'medium' | 'low' | 'info'

export interface TodoItem {
  file: string
  category: TodoCategory
  severity: TodoSeverity
  message: string
  location?: string
  suggestion?: string
  relatedFiles?: string[]
}

export interface RefactorSession {
  timestamp: string
  filesProcessed: number
  successCount: number
  todosGenerated: number
  todos: TodoItem[]
}

export type AddTodo = (todo: TodoItem) => void
