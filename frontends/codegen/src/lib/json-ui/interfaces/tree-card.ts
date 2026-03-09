export interface TreeCardProps {
  tree: {
    name: string
    description?: string
    rootNodes: any[]
  }
  isSelected: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  disableDelete?: boolean
  className?: string
}
