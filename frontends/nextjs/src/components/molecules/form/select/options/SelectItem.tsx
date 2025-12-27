'use client'

import { MenuItem, MenuItemProps } from '@mui/material'
import { forwardRef } from 'react'

export interface SelectItemProps extends MenuItemProps {
  textValue?: string
}

const SelectItem = forwardRef<HTMLLIElement, SelectItemProps>(({ value, children, ...props }, ref) => {
  return (
    <MenuItem ref={ref} value={value} {...props}>
      {children}
    </MenuItem>
  )
})

SelectItem.displayName = 'SelectItem'

export { SelectItem }
