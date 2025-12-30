'use client'

import { AppBar, Toolbar, Slide } from '@/fakemui'
import { forwardRef, ReactNode, useEffect, useState } from 'react'

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
import styles from './Navigation.module.scss'

interface NavigationProps {
  children: ReactNode
  position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative'
  color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'transparent'
  elevation?: number
  hideOnScroll?: boolean
}

/**
 * Custom hook to detect scroll direction for hide-on-scroll behavior
 */
const useScrollTrigger = (): boolean => {
  const [trigger, setTrigger] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY
    const threshold = 100

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setTrigger(currentScrollY > threshold && currentScrollY > lastScrollY)
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return trigger
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
        className={styles.appBar}
        {...props}
      >
        <Toolbar className={styles.toolbar}>{children}</Toolbar>
      </AppBar>
    )

    if (hideOnScroll) {
      return (
        <Slide direction="down" in={!trigger}>
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
}
