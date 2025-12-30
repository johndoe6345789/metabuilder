'use client'

import { ToggleButton, ToggleButtonGroup } from '@/fakemui/fakemui/inputs'
import { forwardRef, ReactNode } from 'react'
import styles from './ToggleGroup.module.scss'

interface ToggleGroupProps {
  children: ReactNode
  type?: 'single' | 'multiple'
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  disabled?: boolean
  className?: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      children,
      type = 'single',
      value,
      defaultValue,
      onValueChange,
      disabled,
      variant = 'default',
      size = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const handleChange = (_: React.MouseEvent, newValue: string | string[] | null) => {
      if (newValue !== null) {
        onValueChange?.(newValue)
      }
    }

    const sizeMap = {
      sm: 'small' as const,
      default: 'medium' as const,
      lg: 'large' as const,
    }

    const classes = [
      styles.toggleGroup,
      variant === 'outline' ? styles.outline : styles.default,
      className,
    ].filter(Boolean).join(' ')

    return (
      <ToggleButtonGroup
        ref={ref}
        exclusive={type === 'single'}
        value={value ?? defaultValue ?? null}
        onChange={handleChange}
        disabled={disabled}
        size={sizeMap[size]}
        className={classes}
        {...props}
      >
        {children}
      </ToggleButtonGroup>
    )
  }
)
ToggleGroup.displayName = 'ToggleGroup'

interface ToggleGroupItemProps {
  children: ReactNode
  value: string
  disabled?: boolean
  className?: string
}

const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ children, value, disabled, className = '', ...props }, ref) => {
    return (
      <ToggleButton
        ref={ref}
        value={value}
        disabled={disabled}
        className={`${styles.toggleGroupItem} ${className}`}
        {...props}
      >
        {children}
      </ToggleButton>
    )
  }
)
ToggleGroupItem.displayName = 'ToggleGroupItem'

export { ToggleGroup, ToggleGroupItem }
