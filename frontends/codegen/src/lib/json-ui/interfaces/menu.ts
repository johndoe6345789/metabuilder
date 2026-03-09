export interface MenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  selected?: boolean
  divider?: boolean
  danger?: boolean
  shortcut?: string
  onClick?: () => void
}

export interface MenuProps {
  trigger: React.ReactNode
  items: MenuItem[]
  className?: string
}
