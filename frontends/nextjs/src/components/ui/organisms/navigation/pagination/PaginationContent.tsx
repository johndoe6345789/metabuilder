'use client'

import { forwardRef, ReactNode } from 'react'
import { Box } from '@mui/material'

interface PaginationContentProps {
  children: ReactNode
}

interface PaginationItemWrapperProps {
  children: ReactNode
}

const PaginationContent = forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="ul"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          listStyle: 'none',
          p: 0,
          m: 0,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = forwardRef<HTMLLIElement, PaginationItemWrapperProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box component="li" ref={ref} {...props}>
        {children}
      </Box>
    )
  }
)
PaginationItem.displayName = 'PaginationItem'

export { PaginationContent, PaginationItem }
export type { PaginationContentProps, PaginationItemWrapperProps }
