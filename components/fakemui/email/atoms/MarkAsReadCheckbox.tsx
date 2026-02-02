import React, { forwardRef, useState } from 'react'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface MarkAsReadCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isRead?: boolean
  onToggleRead?: (read: boolean) => void
  testId?: string
}

export const MarkAsReadCheckbox = forwardRef<HTMLInputElement, MarkAsReadCheckboxProps>(
  ({ isRead = false, onToggleRead, testId: customTestId, ...props }, ref) => {
    const [read, setRead] = useState(isRead)

    const accessible = useAccessible({
      feature: 'email',
      component: 'read-checkbox',
      identifier: customTestId || 'read-status'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newState = e.target.checked
      setRead(newState)
      onToggleRead?.(newState)
      props.onChange?.(e)
    }

    return (
      <input
        ref={ref}
        type="checkbox"
        checked={read}
        className="read-checkbox"
        aria-label="Mark as read"
        {...accessible}
        {...props}
        onChange={handleChange}
      />
    )
  }
)

MarkAsReadCheckbox.displayName = 'MarkAsReadCheckbox'
