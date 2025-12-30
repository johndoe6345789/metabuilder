'use client'

import { Box } from '@fakemui/layout/Box'
import type { BoxProps } from '@fakemui/layout/Box'
import { forwardRef, useContext } from 'react'

import { TabsContext } from '../core/tabs-context'

export type TabsListProps = Omit<BoxProps, 'ref'>

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(({ children, style, ...props }, ref) => {
  const context = useContext(TabsContext)

  if (!context) {
    throw new Error('TabsList must be used within Tabs')
  }

  return (
    <Box
      ref={ref as React.Ref<HTMLElement>}
      role="tablist"
      aria-orientation="horizontal"
      style={{
        display: 'inline-flex',
        height: '36px',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        borderRadius: '8px',
        padding: '4px',
        ...style,
      }}
      {...props}
    >
      {children}
    </Box>
  )
})

TabsList.displayName = 'TabsList'

export { TabsList }
