'use client'

import { Box } from '@/fakemui'
import type { MouseEvent, CSSProperties, ButtonHTMLAttributes } from 'react'
import { forwardRef, useContext } from 'react'

import { TabsContext } from '../core/tabs-context'
import styles from './TabsTrigger.module.scss'

export interface TabsTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  value: string
  style?: CSSProperties
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ children, value, onClick, disabled, style, className, ...props }, ref) => {
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
        ref={ref as React.Ref<HTMLElement>}
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
        className={`${styles.tabsTrigger} ${className ?? ''}`}
        style={style}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

TabsTrigger.displayName = 'TabsTrigger'

export { TabsTrigger }
