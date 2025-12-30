'use client'

import { Box, IconButton, Typography } from '@/fakemui'
import { forwardRef } from 'react'

import styles from './pagination.module.scss'
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
        className={styles.simplePagination}
        {...props}
      >
        <IconButton
          onClick={onPrevious}
          disabled={disabled || !hasPrevious}
          sm
          className={styles.simplePaginationButton}
        >
          <PreviousIcon />
          <Typography variant="body2" className={styles.simplePaginationLabel}>
            {previousLabel}
          </Typography>
        </IconButton>
        <IconButton
          onClick={onNext}
          disabled={disabled || !hasNext}
          sm
          className={styles.simplePaginationButton}
        >
          <Typography variant="body2" className={styles.simplePaginationLabel}>
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
