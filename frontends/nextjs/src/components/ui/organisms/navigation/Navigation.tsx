'use client'

import { AppBar, Slide, Toolbar, useScrollTrigger } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

import {
  NavigationContent,
  NavigationItem,
  NavigationLink,
  NavigationList,
  NavigationMenu,
  NavigationTrigger,
} from './NavigationMenuItems'
import { NavigationMobileToggle } from './NavigationResponsive'
import { NavigationBrand, NavigationSeparator, NavigationSpacer } from './NavigationStyling'
import { NavigationItemType } from './utils/navigationConfig'
import { useNavigationDropdown } from './utils/navigationHelpers'

interface NavigationProps {
  children: ReactNode
  position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative'
  color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'transparent'
  elevation?: number
  hideOnScroll?: boolean
}

const Navigation = forwardRef<HTMLElement, NavigationProps>(
  (
    {
      children,
      position = 'sticky',
      color = 'default',
      elevation = 0,
      hideOnScroll = false,
      ...props
    },
    ref
  ) => {
    const trigger = useScrollTrigger()

    const appBar = (
      <AppBar
        ref={ref}
        position={position}
        color={color}
        elevation={elevation}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
        {...props}
      >
        <Toolbar>{children}</Toolbar>
      </AppBar>
    )

    if (hideOnScroll) {
      return (
        <Slide appear={false} direction="down" in={!trigger}>
          {appBar}
        </Slide>
      )
    }

    return appBar
  }
)
Navigation.displayName = 'Navigation'

export {
  Navigation,
  NavigationBrand,
  NavigationContent,
  NavigationItem,
  NavigationLink,
  NavigationList,
  NavigationMenu,
  NavigationMobileToggle,
  NavigationSeparator,
  NavigationSpacer,
  NavigationTrigger,
  useNavigationDropdown,
}
export type { NavigationItemType }
