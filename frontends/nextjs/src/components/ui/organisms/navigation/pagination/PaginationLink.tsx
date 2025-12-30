'use client'

import { IconButton } from '@/fakemui'
import { forwardRef } from 'react'

import styles from './pagination.module.scss'
import { type PaginationLinkProps } from './paginationTypes'

const PaginationLink = forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ children, onClick, isActive = false, disabled = false, size = 'medium', ...props }, ref) => {
    const sizeClass = size === 'small' ? styles.paginationLinkSmall : size === 'large' ? styles.paginationLinkLarge : ''
    const activeClass = isActive ? styles.paginationLinkActive : ''
    
    return (
      <IconButton
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={`${styles.paginationLink} ${sizeClass} ${activeClass}`}
        {...props}
      >
        {children}
      </IconButton>
    )
  }
)
PaginationLink.displayName = 'PaginationLink'

export { PaginationLink }
