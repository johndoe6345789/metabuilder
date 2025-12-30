import { forwardRef } from 'react'

import { IconButton } from '@/fakemui'
import { Menu as MenuIcon } from '@/fakemui/icons'

import styles from './Navigation.module.scss'

interface NavigationMobileToggleProps {
  onClick: () => void
}

const NavigationMobileToggle = forwardRef<HTMLButtonElement, NavigationMobileToggleProps>(
  ({ onClick, ...props }, ref) => {
    return (
      <IconButton
        ref={ref}
        onClick={onClick}
        className={styles.mobileToggle}
        {...props}
      >
        <MenuIcon />
      </IconButton>
    )
  }
)
NavigationMobileToggle.displayName = 'NavigationMobileToggle'

export { NavigationMobileToggle }
