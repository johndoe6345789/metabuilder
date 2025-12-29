'use client'

import { Box } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

// NavigationMenu container
export interface NavigationMenuProps {
  children: ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

const NavigationMenuCore = forwardRef<HTMLDivElement, NavigationMenuProps>(
  ({ children, orientation = 'horizontal', ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          flexDirection: orientation === 'horizontal' ? 'row' : 'column',
          alignItems: orientation === 'horizontal' ? 'center' : 'stretch',
          gap: 0.5,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationMenuCore.displayName = 'NavigationMenuCore'

// NavigationMenuList
const NavigationMenuList = forwardRef<
  HTMLUListElement,
  { children: ReactNode; className?: string }
>(({ children, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      component="ul"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0.5,
        listStyle: 'none',
        m: 0,
        p: 0,
      }}
      {...props}
    >
      {children}
    </Box>
  )
})
NavigationMenuList.displayName = 'NavigationMenuList'

// NavigationMenuItem
interface NavigationMenuItemProps {
  children: ReactNode
  className?: string
}

const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} component="li" sx={{ position: 'relative' }} {...props}>
        {children}
      </Box>
    )
  }
)
NavigationMenuItem.displayName = 'NavigationMenuItem'

export { NavigationMenuCore, NavigationMenuItem, NavigationMenuList }
