import { ReactNode } from 'react'

export interface ButtonProps {
  children?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  loading?: boolean
  fullWidth?: boolean
  disabled?: boolean
  className?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}
