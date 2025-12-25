'use client'

import { forwardRef, ReactNode, useState, ElementType } from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  useScrollTrigger,
  Slide,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// Types
interface NavigationItem {
  label: string
  href?: string
  onClick?: () => void
  icon?: ReactNode
  children?: NavigationItem[]
  disabled?: boolean
}

// Navigation Root (AppBar)
interface NavigationProps {
  children: ReactNode
  position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative'
  color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'transparent'
  elevation?: number
  hideOnScroll?: boolean
}

const Navigation = forwardRef<HTMLElement, NavigationProps>(
  ({ children, position = 'sticky', color = 'default', elevation = 0, hideOnScroll = false, ...props }, ref) => {
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

// NavigationMenu - Container for nav items
interface NavigationMenuProps {
  children: ReactNode
}

const NavigationMenu = forwardRef<HTMLDivElement, NavigationMenuProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="nav"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationMenu.displayName = 'NavigationMenu'

// NavigationList - List of items
interface NavigationListProps {
  children: ReactNode
}

const NavigationList = forwardRef<HTMLUListElement, NavigationListProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        component="ul"
        sx={{
          display: 'flex',
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
  }
)
NavigationList.displayName = 'NavigationList'

// NavigationItem - Single nav item (may have dropdown)
interface NavigationItemProps {
  children: ReactNode
}

const NavigationItem = forwardRef<HTMLLIElement, NavigationItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box component="li" ref={ref} sx={{ position: 'relative' }} {...props}>
        {children}
      </Box>
    )
  }
)
NavigationItem.displayName = 'NavigationItem'

// NavigationTrigger - Button that opens dropdown
interface NavigationTriggerProps {
  children: ReactNode
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  hasDropdown?: boolean
}

const NavigationTrigger = forwardRef<HTMLButtonElement, NavigationTriggerProps>(
  ({ children, onClick, hasDropdown = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        color="inherit"
        endIcon={hasDropdown ? <ExpandMoreIcon fontSize="small" /> : undefined}
        sx={{
          textTransform: 'none',
          fontWeight: 500,
          color: 'text.primary',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
NavigationTrigger.displayName = 'NavigationTrigger'

// NavigationContent - Dropdown content
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
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          elevation: 2,
          sx: {
            mt: 1,
            minWidth: 200,
          },
        }}
        {...props}
      >
        {children}
      </Menu>
    )
  }
)
NavigationContent.displayName = 'NavigationContent'

// NavigationLink - Link within navigation
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

const NavigationLink = forwardRef<HTMLElement, NavigationLinkProps>(
  ({ children, href, onClick, active = false, disabled = false, icon, asChild, component, ...props }, ref) => {
    if (asChild || component) {
      return (
        <MenuItem
          ref={ref}
          component={component || 'a'}
          href={href}
          onClick={onClick}
          disabled={disabled}
          selected={active}
          {...props}
        >
          {icon && <ListItemIcon>{icon}</ListItemIcon>}
          <ListItemText>{children}</ListItemText>
        </MenuItem>
      )
    }

    return (
      <MenuItem
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        selected={active}
        sx={{
          borderRadius: 1,
        }}
        {...props}
      >
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText>{children}</ListItemText>
      </MenuItem>
    )
  }
)
NavigationLink.displayName = 'NavigationLink'

// NavigationBrand - Logo/brand area
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
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: onClick || href ? 'pointer' : 'default',
          mr: 2,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationBrand.displayName = 'NavigationBrand'

// NavigationSeparator
const NavigationSeparator = forwardRef<HTMLHRElement, Record<string, never>>(
  (props, ref) => {
    return <Divider ref={ref} orientation="vertical" flexItem sx={{ mx: 1 }} {...props} />
  }
)
NavigationSeparator.displayName = 'NavigationSeparator'

// NavigationSpacer - Flex spacer
const NavigationSpacer = forwardRef<HTMLDivElement, Record<string, never>>(
  (props, ref) => {
    return <Box ref={ref} sx={{ flexGrow: 1 }} {...props} />
  }
)
NavigationSpacer.displayName = 'NavigationSpacer'

// NavigationMobileToggle - Hamburger menu for mobile
interface NavigationMobileToggleProps {
  onClick: () => void
}

const NavigationMobileToggle = forwardRef<HTMLButtonElement, NavigationMobileToggleProps>(
  ({ onClick, ...props }, ref) => {
    return (
      <IconButton
        ref={ref}
        onClick={onClick}
        edge="start"
        color="inherit"
        sx={{
          display: { sm: 'none' },
          mr: 2,
        }}
        {...props}
      >
        <MenuIcon />
      </IconButton>
    )
  }
)
NavigationMobileToggle.displayName = 'NavigationMobileToggle'

// Helper hook for dropdown navigation
function useNavigationDropdown() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return {
    anchorEl,
    open,
    handleOpen,
    handleClose,
  }
}

export {
  Navigation,
  NavigationMenu,
  NavigationList,
  NavigationItem,
  NavigationTrigger,
  NavigationContent,
  NavigationLink,
  NavigationBrand,
  NavigationSeparator,
  NavigationSpacer,
  NavigationMobileToggle,
  useNavigationDropdown,
}
export type { NavigationItem as NavigationItemType }
