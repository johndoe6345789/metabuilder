'use client'

import { Typography } from '@/fakemui'
import type { PaginationMetadata } from '@/lib/api/pagination'

export interface PaginationInfoProps {
  metadata: PaginationMetadata
}

/**
 * Display pagination information text
 * 
 * Shows "Showing X-Y of Z items" information
 * following MetaBuilder's design system using Material-UI components
 */
export function PaginationInfo({ metadata }: PaginationInfoProps) {
  const start = (metadata.page - 1) * metadata.limit + 1
  const end = Math.min(metadata.page * metadata.limit, metadata.total)

  if (metadata.total === 0) {
    return (
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
      >
        No items found
      </Typography>
    )
  }

  return (
    <Typography 
      variant="body2" 
      color="text.secondary"
      sx={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
    >
      Showing {start}-{end} of {metadata.total} items
    </Typography>
  )
}
