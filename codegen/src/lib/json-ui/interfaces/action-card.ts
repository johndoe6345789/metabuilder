import { ReactNode } from 'react'

export interface ActionCardProps {
  icon?: ReactNode
  title: string
  description?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
}
