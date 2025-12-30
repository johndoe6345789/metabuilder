'use client'

import { forwardRef } from 'react'

import { Box } from '@/fakemui'

import styles from './pagination.module.scss'

const PaginationEllipsis = forwardRef<HTMLSpanElement, Record<string, never>>((props, ref) => {
  return (
    <Box
      ref={ref}
      component="span"
      className={styles.paginationEllipsis}
      {...props}
    >
      ...
    </Box>
  )
})
PaginationEllipsis.displayName = 'PaginationEllipsis'

export { PaginationEllipsis }
