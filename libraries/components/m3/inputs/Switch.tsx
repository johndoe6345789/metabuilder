import React, { forwardRef } from 'react'
import { useAccessible } from '../../../hooks/useAccessible'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  /** Unique identifier for testing and accessibility */
  testId?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className = '', testId, ...props }, ref) => {
    const accessible = useAccessible({
      feature: 'form',
      component: 'switch',
      identifier: testId || String(label),
    })

    return (
      <label className={`switch ${className}`} data-testid={accessible['data-testid']}>
        <input
          ref={ref}
          type="checkbox"
          className="switch-input"
          role="switch"
          aria-checked={props.checked}
          {...props}
        />
        <span className="switch-track" aria-hidden="true" />
        {label && <span className="switch-label">{label}</span>}
      </label>
    )
  }
)

Switch.displayName = 'Switch'
