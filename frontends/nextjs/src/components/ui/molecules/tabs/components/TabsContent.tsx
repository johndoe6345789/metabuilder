'use client'

import { Box } from '@fakemui/layout/Box'
import type { BoxProps } from '@fakemui/layout/Box'
import { forwardRef, useContext } from 'react'

import { TabsContext } from '../core/tabs-context'

export interface TabsContentProps extends Omit<BoxProps, 'ref'> {
  value: string
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ children, value, style, ...props }, ref) => {
    const context = useContext(TabsContext)

    if (!context) {
      throw new Error('TabsContent must be used within Tabs')
    }

    const isActive = context.value === value

    return (
      <Box
        ref={ref as React.Ref<HTMLElement>}
        role="tabpanel"
        id={`${context.idPrefix}-panel-${value}`}
        aria-labelledby={`${context.idPrefix}-tab-${value}`}
        hidden={!isActive}
        style={{
          flex: 1,
          outline: 'none',
          display: isActive ? 'block' : 'none',
          ...style,
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
