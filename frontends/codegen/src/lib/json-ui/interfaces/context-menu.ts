import { ReactNode } from 'react'

export interface ContextMenuItemType {
  label: string
  icon?: ReactNode
  shortcut?: string
  onSelect?: () => void
  disabled?: boolean
  separator?: boolean
  submenu?: ContextMenuItemType[]
}

export interface ContextMenuProps {
  trigger: ReactNode
  items: ContextMenuItemType[]
}
