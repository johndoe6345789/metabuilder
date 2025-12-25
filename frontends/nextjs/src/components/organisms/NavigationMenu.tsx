'use client'

import { forwardRef, ReactNode } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

// NavigationMenu container
export interface NavigationMenuProps {
  children: ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

const NavigationMenu = forwardRef<HTMLDivElement, NavigationMenuProps>(
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
NavigationMenu.displayName = 'NavigationMenu'

// NavigationMenuList
const NavigationMenuList = forwardRef<HTMLUListElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
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
  }
)
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

// NavigationMenuTrigger
interface NavigationMenuTriggerProps {
  children: ReactNode
  className?: string
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        endIcon={<ChevronDownIcon />}
        sx={{
          color: 'text.primary',
          textTransform: 'none',
          fontWeight: 500,
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
NavigationMenuTrigger.displayName = 'NavigationMenuTrigger'

// NavigationMenuContent
interface NavigationMenuContentProps {
  children: ReactNode
  className?: string
  anchorEl?: HTMLElement | null
  open?: boolean
  onClose?: () => void
}

const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ children, anchorEl, open, onClose, ...props }, ref) => {
    return (
      <Menu
        ref={ref}
        anchorEl={anchorEl}
        open={open ?? Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 1,
            boxShadow: 3,
          },
        }}
        {...props}
      >
        {children}
      </Menu>
    )
  }
)
NavigationMenuContent.displayName = 'NavigationMenuContent'

// NavigationMenuLink
interface NavigationMenuLinkProps {
  children: ReactNode
  href?: string
  active?: boolean
  onClick?: () => void
  className?: string
}

const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ children, href, active, onClick, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        component={href ? 'a' : 'button'}
        href={href}
        onClick={onClick}
        sx={{
          color: active ? 'primary.main' : 'text.primary',
          textTransform: 'none',
          fontWeight: 500,
          minWidth: 'auto',
          px: 2,
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
NavigationMenuLink.displayName = 'NavigationMenuLink'

// NavigationMenuIndicator
const NavigationMenuIndicator = forwardRef<HTMLDivElement, { className?: string }>((props, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        bottom: 0,
        height: 2,
        bgcolor: 'primary.main',
        transition: 'all 0.2s',
      }}
      {...props}
    />
  )
})
NavigationMenuIndicator.displayName = 'NavigationMenuIndicator'

// NavigationMenuViewport
const NavigationMenuViewport = forwardRef<HTMLDivElement, { children?: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 3,
          overflow: 'hidden',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
NavigationMenuViewport.displayName = 'NavigationMenuViewport'

// Helper: navigationMenuTriggerStyle (returns sx props for consistent styling)
const navigationMenuTriggerStyle = () => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  px: 2,
  py: 1,
  fontSize: '0.875rem',
  fontWeight: 500,
  borderRadius: 1,
  transition: 'all 0.2s',
  '&:hover': {
    bgcolor: 'action.hover',
  },
  '&:focus': {
    bgcolor: 'action.focus',
  },
})

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
