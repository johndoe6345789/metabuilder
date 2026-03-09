export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}
