'use client'

import { Box, type BoxProps, type SxProps, type Theme } from '@mui/material'
import { forwardRef } from 'react'

export interface ScrollAreaProps extends Omit<BoxProps, 'ref'> {
  /** Custom styles for the scroll container */
  sx?: SxProps<Theme>
  /** CSS class name */
  className?: string
  /** Children to render inside scroll area */
  children?: React.ReactNode
}

/**
 * ScrollArea - MUI-based scrollable container
 * Provides a styled scrollable area with custom scrollbar styling
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className, sx, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={className}
        sx={{
          overflow: 'auto',
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
          // Dark mode scrollbar
          '[data-mui-color-scheme="dark"] &::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          },
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

ScrollArea.displayName = 'ScrollArea'

/**
 * ScrollBar - Placeholder for Radix ScrollBar API compatibility
 * Not needed with MUI implementation but exported for compatibility
 */
export const ScrollBar = forwardRef<HTMLDivElement, BoxProps>(({ ...props }, ref) => {
  // MUI handles scrollbars natively via CSS
  return <Box ref={ref} sx={{ display: 'none' }} {...props} />
})

ScrollBar.displayName = 'ScrollBar'
