// m3/email/atoms/MarkAsReadCheckbox.tsx
import React, { forwardRef, useState } from 'react'
import { useAccessible } from '../../../../hooks/useAccessible'

export interface MarkAsReadCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isRead?: boolean
  onToggleRead?: (read: boolean) => void
  testId?: string
}

export const MarkAsReadCheckbox = forwardRef<
  HTMLInputElement,
  MarkAsReadCheckboxProps
>(({ isRead = false, onToggleRead, testId, ...props }, ref) => {
  const [read, setRead] = useState(isRead)

  const accessible = useAccessible({
    feature: 'email',
    component: 'read-checkbox',
    identifier: testId || 'read-status'
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const next = e.target.checked
    setRead(next)
    onToggleRead?.(next)
    props.onChange?.(e)
  }

  const label = read ? 'Mark as unread' : 'Mark as read'

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={read}
      className="read-checkbox"
      aria-label={label}
      {...accessible}
      {...props}
      onChange={handleChange}
    />
  )
})

MarkAsReadCheckbox.displayName = 'MarkAsReadCheckbox'
