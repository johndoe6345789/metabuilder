import { ReactNode } from 'react'

export interface BadgeProps {
  children?: ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | string
  size?: 'sm' | 'md' | 'lg' | string
  icon?: ReactNode
  className?: string
}
