import { ReactNode } from 'react'

export interface AlertProps {
  variant?: 'info' | 'warning' | 'success' | 'error' | string
  title?: string
  children?: ReactNode
  className?: string
}
