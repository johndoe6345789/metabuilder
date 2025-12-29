import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { ReactNode } from 'react'

interface PaginationLinkProps {
  children: ReactNode
  onClick?: () => void
  isActive?: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const paginationSizeMap = {
  small: { minWidth: 28, height: 28 },
  medium: { minWidth: 36, height: 36 },
  large: { minWidth: 44, height: 44 },
}

const PreviousIcon = () => <ChevronLeftIcon fontSize="small" />

const NextIcon = () => <ChevronRightIcon fontSize="small" />

export { NextIcon, paginationSizeMap, PreviousIcon }
export type { PaginationLinkProps }
