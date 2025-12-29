'use client'

import { Box } from '@mui/material'
import { forwardRef } from 'react'

const PaginationEllipsis = forwardRef<HTMLSpanElement, Record<string, never>>((props, ref) => {
  return (
    <Box
      ref={ref}
      component="span"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        color: 'text.secondary',
      }}
      {...props}
    >
      ...
    </Box>
  )
})
PaginationEllipsis.displayName = 'PaginationEllipsis'

export { PaginationEllipsis }
