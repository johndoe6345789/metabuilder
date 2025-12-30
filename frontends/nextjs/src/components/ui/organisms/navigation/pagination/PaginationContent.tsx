'use client'

import { Box } from '@/fakemui'
import { forwardRef, ReactNode } from 'react'

import styles from './pagination.module.scss'

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
        className={styles.paginationContent}
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
