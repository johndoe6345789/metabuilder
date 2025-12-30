'use client'

import { Switch as FakemuiSwitch, SwitchProps as FakemuiSwitchProps } from '@/fakemui/fakemui/inputs'
import { forwardRef } from 'react'
import styles from './Switch.module.scss'

/**
 * Props for the Switch component
 * @extends {FakemuiSwitchProps} Inherits fakemui Switch props
 */
export interface SwitchProps extends Omit<FakemuiSwitchProps, 'onChange'> {
  /** Callback when checked state changes (alternative to onChange) */
  onCheckedChange?: (checked: boolean) => void
  /** Standard onChange handler */
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ onCheckedChange, onChange, className, ...props }, ref) => {
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      onChange?.(event)
      onCheckedChange?.(event.target.checked)
    }

    return (
      <FakemuiSwitch
        ref={ref}
        onChange={handleChange}
        className={`${styles.switch} ${className || ''}`}
        {...props}
      />
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
