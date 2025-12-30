'use client'

import { ButtonHTMLAttributes, forwardRef, HTMLAttributes } from 'react'

import { Box, Tab as FakeMuiTab, TabProps as FakeMuiTabProps,Tabs as FakeMuiTabs } from '@/fakemui'

import styles from './Tabs.module.scss'

// Tabs container
export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  variant?: 'standard' | 'scrollable' | 'fullWidth'
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, children, className, variant, ...props }, ref) => {
    return (
      <Box ref={ref} className={`${styles.tabsWrapper} ${className || ''}`} {...props}>
        <FakeMuiTabs
          value={value || defaultValue}
          onChange={(_, newValue) => onValueChange?.(newValue)}
          variant={variant}
          className={styles.tabs}
        >
          {children}
        </FakeMuiTabs>
      </Box>
    )
  }
)
Tabs.displayName = 'Tabs'

// TabsList (wrapper for tabs - for shadcn compat)
const TabsList = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <Box ref={ref} className={`${styles.tabsList} ${className || ''}`} {...props}>
        {children}
      </Box>
    )
  }
)
TabsList.displayName = 'TabsList'

// TabsTrigger (individual tab)
export interface TabsTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string
  label?: React.ReactNode
  selected?: boolean
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, label, children, className, selected, ...props }, ref) => {
    return (
      <FakeMuiTab
        ref={ref}
        value={value}
        label={label || children}
        selected={selected}
        className={`${styles.tabTrigger} ${className || ''}`}
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
  ({ value, children, forceMount, className, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        role="tabpanel"
        hidden={!forceMount}
        id={`tabpanel-${value}`}
        aria-labelledby={`tab-${value}`}
        className={`${styles.tabContent} ${className || ''}`}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsContent, TabsList, TabsTrigger }
