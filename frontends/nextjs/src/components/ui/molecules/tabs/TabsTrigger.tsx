'use client'

import { forwardRef, useContext } from 'react'
import type { MouseEvent } from 'react'
import { Box } from '@mui/material'
import type { BoxProps } from '@mui/material'
import { TabsContext } from './tabs-context'

export interface TabsTriggerProps extends BoxProps<'button'> {
  value: string
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ children, value, onClick, disabled, sx, ...props }, ref) => {
    const context = useContext(TabsContext)

    if (!context) {
      throw new Error('TabsTrigger must be used within Tabs')
    }

    const isSelected = context.value === value

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return
      onClick?.(event)
      if (!event.defaultPrevented) {
        context.setValue(value)
      }
    }

    return (
      <Box
        ref={ref}
        component="button"
        type="button"
        role="tab"
        id={`${context.idPrefix}-tab-${value}`}
        aria-controls={`${context.idPrefix}-panel-${value}`}
        aria-selected={isSelected}
        tabIndex={isSelected ? 0 : -1}
        disabled={disabled}
        data-state={isSelected ? 'active' : 'inactive'}
        data-value={value}
        onClick={handleClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          px: 2,
          py: 0.75,
          fontSize: '0.875rem',
          fontWeight: 500,
          borderRadius: 1.5,
          border: 0,
          bgcolor: 'transparent',
          color: 'text.secondary',
          cursor: 'pointer',
          transition: 'all 0.15s',
          '&:hover': {
            color: 'text.primary',
          },
          '&[aria-selected="true"]': {
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 1,
          },
          '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

TabsTrigger.displayName = 'TabsTrigger'

export { TabsTrigger }
