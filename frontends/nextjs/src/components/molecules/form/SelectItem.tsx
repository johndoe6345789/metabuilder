'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'

import { MenuItem } from '@/fakemui'

export interface SelectItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string | number
  textValue?: string
  selected?: boolean
  disabled?: boolean
}

const SelectItem = forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ value, children, selected, disabled, ...props }, ref) => {
    return (
      <MenuItem ref={ref} selected={selected} disabled={disabled} data-value={value} {...props}>
        {children}
      </MenuItem>
    )
  }
)

SelectItem.displayName = 'SelectItem'

export { SelectItem }
