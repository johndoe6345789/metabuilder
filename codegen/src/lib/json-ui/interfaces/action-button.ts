import { ReactNode } from 'react'

export interface ActionButtonProps {
  icon?: ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  tooltip?: string
  disabled?: boolean
  className?: string
}
