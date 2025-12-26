'use client'

import { forwardRef, useContext } from 'react'
import { Box } from '@mui/material'
import type { BoxProps } from '@mui/material'
import { TabsContext } from './tabs-context'

export interface TabsContentProps extends BoxProps {
  value: string
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ children, value, sx, ...props }, ref) => {
    const context = useContext(TabsContext)

    if (!context) {
      throw new Error('TabsContent must be used within Tabs')
    }

    const isActive = context.value === value

    return (
      <Box
        ref={ref}
        role="tabpanel"
        id={`${context.idPrefix}-panel-${value}`}
        aria-labelledby={`${context.idPrefix}-tab-${value}`}
        hidden={!isActive}
        sx={{
          flex: 1,
          outline: 'none',
          display: isActive ? 'block' : 'none',
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

TabsContent.displayName = 'TabsContent'

export { TabsContent }
