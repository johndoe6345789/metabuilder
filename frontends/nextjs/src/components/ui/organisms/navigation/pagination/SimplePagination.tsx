'use client'

import { Box, IconButton, Typography } from '@mui/material'
import { forwardRef } from 'react'

import { NextIcon, PreviousIcon } from './paginationIcons'

interface SimplePaginationProps {
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
  previousLabel?: string
  nextLabel?: string
  disabled?: boolean
}

const SimplePagination = forwardRef<HTMLDivElement, SimplePaginationProps>(
  (
    {
      hasPrevious,
      hasNext,
      onPrevious,
      onNext,
      previousLabel = 'Previous',
      nextLabel = 'Next',
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
        {...props}
      >
        <IconButton
          onClick={onPrevious}
          disabled={disabled || !hasPrevious}
          size="small"
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            px: 2,
            py: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <PreviousIcon />
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {previousLabel}
          </Typography>
        </IconButton>
        <IconButton
          onClick={onNext}
          disabled={disabled || !hasNext}
          size="small"
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            px: 2,
            py: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Typography variant="body2" sx={{ mr: 0.5 }}>
            {nextLabel}
          </Typography>
          <NextIcon />
        </IconButton>
      </Box>
    )
  }
)
SimplePagination.displayName = 'SimplePagination'

export { SimplePagination }
export type { SimplePaginationProps }
