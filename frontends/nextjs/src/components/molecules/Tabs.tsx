'use client'

import { forwardRef } from 'react'
import {
  Tabs as MuiTabs,
  TabsProps as MuiTabsProps,
  Tab as MuiTab,
  TabProps as MuiTabProps,
  Box,
} from '@mui/material'

// Tabs container
export interface TabsProps extends Omit<MuiTabsProps, 'onChange'> {
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, children, sx, ...props }, ref) => {
    return (
      <Box ref={ref} sx={sx}>
        <MuiTabs
          value={value || defaultValue}
          onChange={(_, newValue) => onValueChange?.(newValue)}
          {...props}
        >
          {children}
        </MuiTabs>
      </Box>
    )
  }
)
Tabs.displayName = 'Tabs'

// TabsList (wrapper for MUI Tabs - for shadcn compat)
const TabsList = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box 
        ref={ref} 
        sx={{ 
          display: 'inline-flex',
          bgcolor: 'action.hover',
          borderRadius: 1,
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

// TabsTrigger (individual tab)
export interface TabsTriggerProps extends Omit<MuiTabProps, 'value'> {
  value: string
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, label, children, sx, ...props }, ref) => {
    return (
      <MuiTab
        ref={ref}
        value={value}
        label={label || children}
        sx={{
          minHeight: 36,
          px: 3,
          py: 1,
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 0.5,
          '&.Mui-selected': {
            bgcolor: 'background.paper',
          },
          ...sx,
        }}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

// TabsContent (content panel)
interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
  forceMount?: boolean
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, forceMount, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        role="tabpanel"
        hidden={!forceMount}
        id={`tabpanel-${value}`}
        aria-labelledby={`tab-${value}`}
        sx={{ pt: 2 }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
