import { ReactNode } from 'react'

export interface TimelineItem {
  title: string
  description?: string
  timestamp?: string
  icon?: ReactNode
  status?: 'completed' | 'current' | 'pending'
}

export interface TimelineProps {
  items: TimelineItem[]
  className?: string
}
