import type { ComponentProps, ReactNode } from 'react'

export interface InfoPanelProps extends ComponentProps<'div'> {
  variant?: string
  title?: string
  icon?: ReactNode
}
