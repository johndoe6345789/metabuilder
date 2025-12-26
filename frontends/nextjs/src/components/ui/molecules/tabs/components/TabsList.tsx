'use client'

import { forwardRef, useContext } from 'react'
import { Box } from '@mui/material'
import type { BoxProps } from '@mui/material'
import { TabsContext } from './tabs-context'

export type TabsListProps = BoxProps

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, sx, ...props }, ref) => {
    const context = useContext(TabsContext)

    if (!context) {
      throw new Error('TabsList must be used within Tabs')
    }

    return (
      <Box
        ref={ref}
        role="tablist"
        aria-orientation="horizontal"
        sx={{
          display: 'inline-flex',
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          borderRadius: 2,
          p: 0.5,
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

TabsList.displayName = 'TabsList'

export { TabsList }
