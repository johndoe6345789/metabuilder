'use client'

import { Box } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

import { KeyboardArrowDown } from '@/fakemui/icons'

interface SelectTriggerProps {
  children: ReactNode
  className?: string
}

const SelectTrigger = forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ children, ...props }, ref) => {
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
        <KeyboardArrowDown size={16} style={{ marginLeft: 4, color: 'rgba(0,0,0,0.54)' }} />
      </Box>
    )
  }
)

SelectTrigger.displayName = 'SelectTrigger'

export { SelectTrigger }
