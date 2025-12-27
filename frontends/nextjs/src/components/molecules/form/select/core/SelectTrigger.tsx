'use client'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Box } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

interface SelectTriggerProps {
  children: ReactNode
  className?: string
}

const SelectTrigger = forwardRef<HTMLDivElement, SelectTriggerProps>(({ children, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.5,
        py: 1,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'text.secondary',
        },
      }}
      {...props}
    >
      {children}
      <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
    </Box>
  )
})

SelectTrigger.displayName = 'SelectTrigger'

export { SelectTrigger }
