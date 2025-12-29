'use client'

import { IconButton } from '@mui/material'
import { forwardRef } from 'react'

import { type PaginationLinkProps, paginationSizeMap } from './paginationUtils'

const PaginationLink = forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ children, onClick, isActive = false, disabled = false, size = 'medium', ...props }, ref) => {
    return (
      <IconButton
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        sx={{
          ...paginationSizeMap[size],
          borderRadius: 1,
          bgcolor: isActive ? 'primary.main' : 'transparent',
          color: isActive ? 'primary.contrastText' : 'text.primary',
          '&:hover': {
            bgcolor: isActive ? 'primary.dark' : 'action.hover',
          },
          '&.Mui-disabled': {
            opacity: 0.5,
          },
        }}
        {...props}
      >
        {children}
      </IconButton>
    )
  }
)
PaginationLink.displayName = 'PaginationLink'

export { PaginationLink }
