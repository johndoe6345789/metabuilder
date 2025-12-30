import { Box, Divider } from '@/fakemui'
import { forwardRef, ReactNode } from 'react'
import styles from './Navigation.module.scss'

interface NavigationBrandProps {
  children: ReactNode
  href?: string
  onClick?: () => void
}

const NavigationBrand = forwardRef<HTMLDivElement, NavigationBrandProps>(
  ({ children, href, onClick, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        onClick={onClick}
        className={`${styles.brand} ${onClick || href ? styles.clickable : ''}`}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationBrand.displayName = 'NavigationBrand'

const NavigationSeparator = forwardRef<HTMLHRElement, Record<string, never>>((props, ref) => {
  return <Divider ref={ref} vertical className={styles.separator} {...props} />
})
NavigationSeparator.displayName = 'NavigationSeparator'

const NavigationSpacer = forwardRef<HTMLDivElement, Record<string, never>>((props, ref) => {
  return <Box ref={ref} className={styles.spacer} {...props} />
})
NavigationSpacer.displayName = 'NavigationSpacer'

export { NavigationBrand, NavigationSeparator, NavigationSpacer }
