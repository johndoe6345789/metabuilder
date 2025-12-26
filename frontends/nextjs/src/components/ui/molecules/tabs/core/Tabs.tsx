'use client'

import { forwardRef, useId, useState } from 'react'
import { Box } from '@mui/material'
import type { BoxProps } from '@mui/material'
import { TabsContext } from './tabs-context'

export interface TabsProps extends BoxProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ children, defaultValue, value, onValueChange, sx, ...props }, ref) => {
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
          ref={ref}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, ...sx }}
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
