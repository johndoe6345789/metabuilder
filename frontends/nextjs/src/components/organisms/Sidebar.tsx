'use client'

import { forwardRef, ReactNode, useState } from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// Sidebar container
export interface SidebarProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  width?: number
  collapsedWidth?: number
  variant?: 'permanent' | 'persistent' | 'temporary'
  side?: 'left' | 'right'
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ 
    children, 
    open = true, 
    onOpenChange, 
    width = 280, 
    collapsedWidth = 64,
    variant = 'permanent',
    side = 'left',
    ...props 
  }, ref) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    if (isMobile || variant === 'temporary') {
      return (
        <Drawer
          ref={ref}
          anchor={side}
          open={open}
          onClose={() => onOpenChange?.(false)}
          PaperProps={{
            sx: { width },
          }}
          {...props}
        >
          {children}
        </Drawer>
      )
    }

    return (
      <Box
        ref={ref}
        component="nav"
        sx={{
          width: open ? width : collapsedWidth,
          flexShrink: 0,
          transition: 'width 0.2s',
          overflow: 'hidden',
        }}
        {...props}
      >
        <Box
          sx={{
            width,
            height: '100%',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      </Box>
    )
  }
)
Sidebar.displayName = 'Sidebar'

// SidebarHeader
const SidebarHeader = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
SidebarHeader.displayName = 'SidebarHeader'

// SidebarContent
const SidebarContent = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 1,
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
SidebarContent.displayName = 'SidebarContent'

// SidebarFooter
const SidebarFooter = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)
SidebarFooter.displayName = 'SidebarFooter'

// SidebarGroup
interface SidebarGroupProps {
  children: ReactNode
  label?: string
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ children, label, collapsible, defaultOpen = true, ...props }, ref) => {
    const [open, setOpen] = useState(defaultOpen)

    return (
      <Box ref={ref} sx={{ mb: 1 }} {...props}>
        {label && (
          <Box
            onClick={collapsible ? () => setOpen(!open) : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              cursor: collapsible ? 'pointer' : 'default',
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontSize: '0.7rem', letterSpacing: 1 }}
            >
              {label}
            </Typography>
            {collapsible && (
              open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
            )}
          </Box>
        )}
        {collapsible ? (
          <Collapse in={open}>
            <List dense disablePadding>
              {children}
            </List>
          </Collapse>
        ) : (
          <List dense disablePadding>
            {children}
          </List>
        )}
      </Box>
    )
  }
)
SidebarGroup.displayName = 'SidebarGroup'

// SidebarGroupLabel
const SidebarGroupLabel = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Typography
        ref={ref}
        variant="overline"
        color="text.secondary"
        sx={{ px: 2, py: 1, fontSize: '0.7rem', letterSpacing: 1 }}
        {...props}
      >
        {children}
      </Typography>
    )
  }
)
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

// SidebarGroupContent
const SidebarGroupContent = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <List ref={ref} dense disablePadding {...props}>
        {children}
      </List>
    )
  }
)
SidebarGroupContent.displayName = 'SidebarGroupContent'

// SidebarMenuItem
interface SidebarMenuItemProps {
  children?: ReactNode
  icon?: ReactNode
  label?: string
  href?: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

const SidebarMenuItem = forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ children, icon, label, href, active, disabled, onClick, ...props }, ref) => {
    const content = children || label

    return (
      <ListItem ref={ref} disablePadding {...props}>
        <ListItemButton
          selected={active}
          disabled={disabled}
          onClick={onClick}
          href={href}
          component={href ? 'a' : 'button'}
          sx={{
            mx: 1,
            borderRadius: 1,
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            },
          }}
        >
          {icon && <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>}
          <ListItemText
            primary={content}
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </ListItemButton>
      </ListItem>
    )
  }
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

// SidebarMenu (alias for List)
const SidebarMenu = forwardRef<HTMLUListElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <List ref={ref} dense disablePadding {...props}>
        {children}
      </List>
    )
  }
)
SidebarMenu.displayName = 'SidebarMenu'

// SidebarMenuButton (alias for ListItemButton)
const SidebarMenuButton = forwardRef<HTMLDivElement, SidebarMenuItemProps>(
  (props, ref) => <SidebarMenuItem ref={ref} {...props} />
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

// SidebarSeparator
const SidebarSeparator = forwardRef<HTMLHRElement>((props, ref) => {
  return <Divider ref={ref} sx={{ my: 1 }} {...props} />
})
SidebarSeparator.displayName = 'SidebarSeparator'

// SidebarTrigger
interface SidebarTriggerProps {
  onClick?: () => void
  className?: string
}

const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ onClick, ...props }, ref) => {
    return (
      <IconButton ref={ref} onClick={onClick} size="small" {...props}>
        <MenuIcon />
      </IconButton>
    )
  }
)
SidebarTrigger.displayName = 'SidebarTrigger'

// SidebarRail
const SidebarRail = forwardRef<HTMLDivElement, { className?: string }>((props, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        right: -4,
        top: 0,
        bottom: 0,
        width: 8,
        cursor: 'col-resize',
        '&:hover': {
          bgcolor: 'primary.main',
          opacity: 0.2,
        },
      }}
      {...props}
    />
  )
})
SidebarRail.displayName = 'SidebarRail'

// SidebarInset
const SidebarInset = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ flex: 1, overflow: 'auto' }} {...props}>
        {children}
      </Box>
    )
  }
)
SidebarInset.displayName = 'SidebarInset'

// SidebarProvider
const SidebarProvider = ({ children }: { children: ReactNode }) => <>{children}</>
SidebarProvider.displayName = 'SidebarProvider'

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarProvider,
}
