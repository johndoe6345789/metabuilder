export type FileCategory = 'component' | 'library' | 'test' | 'tool' | 'dbal' | 'type' | 'other'
export type FileStatus = 'pending' | 'in-progress' | 'completed' | 'skipped'

export interface FileInfo {
  path: string
  lines: number
  category: FileCategory
  priority: number
  status: FileStatus
  reason?: string
}
