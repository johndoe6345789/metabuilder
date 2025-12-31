'use client'

import { forwardRef, ReactNode, useState, SyntheticEvent } from 'react'
import { Tabs as MuiTabs, Tab as MuiTab, Box, TabsProps as MuiTabsProps } from '@mui/material'

interface TabsProps {
  children: ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ children, defaultValue, value, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const currentValue = value ?? internalValue

    const handleChange = (_: SyntheticEvent, newValue: string) => {
      if (!value) setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <Box ref={ref} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} {...props}>
        {/* Pass value down through children */}
        {children}
      </Box>
    )
  }
)
Tabs.displayName = 'Tabs'

interface TabsListProps {
  children: ReactNode
  className?: string
}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'inline-flex',
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          borderRadius: 2,
          p: 0.5,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
TabsList.displayName = 'TabsList'

interface TabsTriggerProps {
  children: ReactNode
  value: string
  disabled?: boolean
  className?: string
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ children, value, disabled, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="button"
        role="tab"
        data-value={value}
        disabled={disabled}
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
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

interface TabsContentProps {
  children: ReactNode
  value: string
  className?: string
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ children, value, ...props }, ref) => {
    return (
      <Box ref={ref} role="tabpanel" data-value={value} sx={{ flex: 1, outline: 'none' }} {...props}>
        {children}
      </Box>
    )
  }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
