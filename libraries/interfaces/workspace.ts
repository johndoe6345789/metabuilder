/**
 * Workspace Domain Interfaces
 * Types for projects and workspace content
 */

export interface Project {
  id: string
  name: string
  description?: string
  workspaceId: string
  starred?: boolean
  updatedAt: string
  color?: string
  workflowCount?: number
}

export interface ProjectMeta {
  workflowCount: number
  lastUpdated: string
}
