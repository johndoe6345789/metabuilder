import { ReactNode } from 'react'

export interface AlertProps {
  variant?: 'info' | 'warning' | 'success' | 'error'
  title?: string
  children: ReactNode
  className?: string
}
