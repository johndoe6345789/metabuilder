'use client'

import { Pagination, Box } from '@/fakemui'
import type { PaginationMetadata } from '@/lib/api/pagination'

export interface PaginationControlsProps {
  metadata: PaginationMetadata
  onPageChange: (page: number) => void
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

/**
 * Material-UI based pagination controls
 * 
 * Displays page navigation with previous/next buttons and page numbers
 * following MetaBuilder's design system using Material-UI components
 */
export function PaginationControls({
  metadata,
  onPageChange,
  size = 'medium',
  disabled = false,
}: PaginationControlsProps) {
  const handleChange = (page: number) => {
    onPageChange(page)
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: 2,
      }}
    >
      <Pagination
        count={metadata.totalPages}
        page={metadata.page}
        onChange={handleChange}
        size={size}
        disabled={disabled}
        showFirstButton
        showLastButton
        color="primary"
        sx={{
          '& .MuiPaginationItem-root': {
            fontFamily: 'IBM Plex Sans, sans-serif',
          },
        }}
      />
    </Box>
  )
}
