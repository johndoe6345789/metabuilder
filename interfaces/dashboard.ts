/**
 * Dashboard Domain Interfaces
 * Types for workspaces, statistics, and achievements
 */

export interface Workspace {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  createdAt: string
  projectCount?: number
}

export interface DashboardStats {
  workspaces: number
  projects: number
  templates: number
  activeUsers: number
}

export interface StatItem {
  label: string
  value: string | number
  trend?: number
  icon?: React.ReactNode
  color?: string
  warning?: boolean
}

export interface Achievement {
  id: string
  title: string
  icon: React.ReactNode
  unlocked: boolean
  progress?: number
  max?: number
}
