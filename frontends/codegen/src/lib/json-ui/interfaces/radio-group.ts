import { ReactNode } from 'react'

export interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  onChange?: (value: string) => void
  name?: string
  options?: Array<{ value: string; label: string }>
  orientation?: 'horizontal' | 'vertical' | string
  disabled?: boolean
  children?: ReactNode
  className?: string
}
