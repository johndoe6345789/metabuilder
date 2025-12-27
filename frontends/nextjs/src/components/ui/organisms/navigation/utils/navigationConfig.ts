import { ReactNode } from 'react'

interface NavigationItem {
  label: string
  href?: string
  onClick?: () => void
  icon?: ReactNode
  children?: NavigationItem[]
  disabled?: boolean
}

export type NavigationItemType = NavigationItem
