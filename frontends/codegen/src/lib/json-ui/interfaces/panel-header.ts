import type { ComponentProps, ReactNode } from 'react'

export interface PanelHeaderProps extends ComponentProps<'div'> {
  title?: string
  subtitle?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
}
