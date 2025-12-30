'use client'

import { forwardRef } from 'react'

import { Pagination as FakeMuiPagination } from '@/fakemui'

interface PaginationProps {
  count: number
  page: number
  onChange: (page: number) => void
  siblingCount?: number
  boundaryCount?: number
  showFirstButton?: boolean
  showLastButton?: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'text' | 'outlined'
  shape?: 'circular' | 'rounded'
  color?: 'primary' | 'secondary' | 'standard'
}

const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      count,
      page,
      onChange,
      siblingCount = 1,
      boundaryCount = 1,
      showFirstButton = false,
      showLastButton = false,
      disabled = false,
      size = 'medium',
      variant = 'outlined',
      shape = 'rounded',
      color = 'primary',
      ...props
    },
    ref
  ) => {
    return (
      <FakeMuiPagination
        ref={ref as React.Ref<HTMLElement>}
        count={count}
        page={page}
        onChange={onChange}
        siblingCount={siblingCount}
        boundaryCount={boundaryCount}
        showFirstButton={showFirstButton}
        showLastButton={showLastButton}
        disabled={disabled}
        size={size}
        variant={variant}
        shape={shape}
        color={color}
        {...props}
      />
    )
  }
)
Pagination.displayName = 'Pagination'

export { Pagination }
export type { PaginationProps }
