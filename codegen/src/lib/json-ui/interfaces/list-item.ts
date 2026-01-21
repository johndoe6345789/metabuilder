export interface ListItemProps {
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  className?: string
  endContent?: React.ReactNode
}
