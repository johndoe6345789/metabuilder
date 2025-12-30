import { type ReactNode } from 'react'

const paginationSizeMap = {
  small: { minWidth: 28, height: 28 },
  medium: { minWidth: 36, height: 36 },
  large: { minWidth: 44, height: 44 },
} as const

interface PaginationLinkProps {
  children: ReactNode
  onClick?: () => void
  isActive?: boolean
  disabled?: boolean
  size?: keyof typeof paginationSizeMap
}

export { paginationSizeMap }
export type { PaginationLinkProps }
