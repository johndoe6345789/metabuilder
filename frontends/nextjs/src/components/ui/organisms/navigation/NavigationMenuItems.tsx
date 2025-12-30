import { ExpandMore as ExpandMoreIcon } from '@/fakemui/icons'
import { Box, Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@/fakemui'
import { ElementType, forwardRef, type MouseEvent, ReactNode } from 'react'
import styles from './Navigation.module.scss'

interface NavigationMenuProps {
  children: ReactNode
}

const NavigationMenu = forwardRef<HTMLDivElement, NavigationMenuProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="nav"
        className={styles.navMenu}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationMenu.displayName = 'NavigationMenu'

interface NavigationListProps {
  children: ReactNode
}

const NavigationList = forwardRef<HTMLUListElement, NavigationListProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="ul"
        className={styles.navList}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationList.displayName = 'NavigationList'

interface NavigationItemProps {
  children: ReactNode
}

const NavigationItem = forwardRef<HTMLLIElement, NavigationItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box component="li" ref={ref} className={styles.navItem} {...props}>
        {children}
      </Box>
    )
  }
)
NavigationItem.displayName = 'NavigationItem'

interface NavigationTriggerProps {
  children: ReactNode
  onClick?: (event: MouseEvent<HTMLElement>) => void
  hasDropdown?: boolean
}

const NavigationTrigger = forwardRef<HTMLButtonElement, NavigationTriggerProps>(
  ({ children, onClick, hasDropdown = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        variant="ghost"
        endIcon={hasDropdown ? <ExpandMoreIcon /> : undefined}
        className={styles.navTrigger}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
NavigationTrigger.displayName = 'NavigationTrigger'

interface NavigationContentProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  children: ReactNode
}

const NavigationContent = forwardRef<HTMLDivElement, NavigationContentProps>(
  ({ anchorEl, open, onClose, children, ...props }, ref) => {
    return (
      <Menu
        ref={ref}
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        className={styles.navContent}
        {...props}
      >
        {children}
      </Menu>
    )
  }
)
NavigationContent.displayName = 'NavigationContent'

interface NavigationLinkProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  icon?: ReactNode
  asChild?: boolean
  component?: ElementType
}

const NavigationLink = forwardRef<HTMLButtonElement, NavigationLinkProps>(
  (
    {
      children,
      href,
      onClick,
      active = false,
      disabled = false,
      icon,
      asChild,
      component,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (href && !onClick) {
        window.location.href = href
      } else if (onClick) {
        onClick()
      }
    }

    return (
      <MenuItem
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        selected={active}
        className={`${styles.navLink} ${active ? styles.active : ''}`}
        {...props}
      >
        {icon && <span className={styles.linkIcon}>{icon}</span>}
        <span>{children}</span>
      </MenuItem>
    )
  }
)
NavigationLink.displayName = 'NavigationLink'

export {
  NavigationContent,
  NavigationItem,
  NavigationLink,
  NavigationList,
  NavigationMenu,
  NavigationTrigger,
}
