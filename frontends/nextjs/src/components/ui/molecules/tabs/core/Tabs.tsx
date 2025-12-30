'use client'

import { Box } from '@fakemui/layout/Box'
import type { BoxProps } from '@fakemui/layout/Box'
import { forwardRef, useId, useState } from 'react'

import { TabsContext } from './tabs-context'

export interface TabsProps extends Omit<BoxProps, 'ref'> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ children, defaultValue, value, onValueChange, style, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const currentValue = value ?? internalValue
    const idPrefix = useId()

    const handleValueChange = (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue)
      }
      onValueChange?.(nextValue)
    }

    return (
      <TabsContext.Provider value={{ value: currentValue, setValue: handleValueChange, idPrefix }}>
        <Box
          ref={ref as React.Ref<HTMLElement>}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            ...style,
          }}
          {...props}
        >
          {children}
        </Box>
      </TabsContext.Provider>
    )
  }
)

Tabs.displayName = 'Tabs'

export { Tabs }
