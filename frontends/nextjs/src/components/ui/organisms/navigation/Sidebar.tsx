// TODO: Split this file (309 LOC) into smaller organisms (<150 LOC each)
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
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'

// Types
interface SidebarItem {
  label: string
  icon?: ReactNode
  href?: string
  onClick?: () => void
  children?: SidebarItem[]
  badge?: ReactNode
  disabled?: boolean
}

interface SidebarProps {
  children?: ReactNode
  open?: boolean
  onClose?: () => void
  width?: number
  variant?: 'permanent' | 'persistent' | 'temporary'
  anchor?: 'left' | 'right'
}

// Sidebar Root
const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ children, open = true, onClose, width = 280, variant = 'permanent', anchor = 'left', ...props }, ref) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const actualVariant = isMobile ? 'temporary' : variant

    return (
      <Drawer
        ref={ref}
        variant={actualVariant}
        anchor={anchor}
        open={open}
        onClose={onClose}
        sx={{
          width: open ? width : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: width,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
        {...props}
      >
        {children}
      </Drawer>
    )
  }
)
Sidebar.displayName = 'Sidebar'

// SidebarHeader
interface SidebarHeaderProps {
  children?: ReactNode
  onClose?: () => void
  showCloseButton?: boolean
}

const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ children, onClose, showCloseButton = false, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          minHeight: 64,
        }}
        {...props}
      >
        {children}
        {showCloseButton && onClose && (
          <IconButton onClick={onClose} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
    )
  }
)
SidebarHeader.displayName = 'SidebarHeader'

// SidebarContent
interface SidebarContentProps {
  children: ReactNode
}

const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
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
interface SidebarFooterProps {
  children: ReactNode
}

const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
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

// SidebarNav
interface SidebarNavProps {
  items: SidebarItem[]
  dense?: boolean
}

const SidebarNav = forwardRef<HTMLUListElement, SidebarNavProps>(
  ({ items, dense = false, ...props }, ref) => {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set())

    const toggleItem = (label: string) => {
      setOpenItems(prev => {
        const next = new Set(prev)
        if (next.has(label)) {
          next.delete(label)
        } else {
          next.add(label)
        }
        return next
      })
    }

    const renderItem = (item: SidebarItem, depth: number = 0) => {
      const hasChildren = item.children && item.children.length > 0
      const isOpen = openItems.has(item.label)

      return (
        <Box key={item.label}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                if (hasChildren) {
                  toggleItem(item.label)
                } else if (item.onClick) {
                  item.onClick()
                }
              }}
              disabled={item.disabled}
              sx={{
                pl: 2 + depth * 2,
                minHeight: dense ? 40 : 48,
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  variant: dense ? 'body2' : 'body1',
                  fontWeight: depth === 0 ? 500 : 400,
                }}
              />
              {item.badge && (
                <Box sx={{ mr: 1 }}>
                  {item.badge}
                </Box>
              )}
              {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
          </ListItem>
          {hasChildren && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding dense={dense}>
                {item.children!.map(child => renderItem(child, depth + 1))}
              </List>
            </Collapse>
          )}
        </Box>
      )
    }

    return (
      <List ref={ref} dense={dense} {...props}>
        {items.map(item => renderItem(item))}
      </List>
    )
  }
)
SidebarNav.displayName = 'SidebarNav'

// SidebarSection
interface SidebarSectionProps {
  title?: string
  children: ReactNode
}

const SidebarSection = forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ title, children, ...props }, ref) => {
    return (
      <Box ref={ref} sx={{ py: 1 }} {...props}>
        {title && (
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {title}
          </Typography>
        )}
        {children}
      </Box>
    )
  }
)
SidebarSection.displayName = 'SidebarSection'

// SidebarSeparator
const SidebarSeparator = forwardRef<HTMLHRElement, Record<string, never>>(
  (props, ref) => {
    return <Divider ref={ref} sx={{ my: 1 }} {...props} />
  }
)
SidebarSeparator.displayName = 'SidebarSeparator'

// SidebarToggle - trigger to open sidebar on mobile
interface SidebarToggleProps {
  onClick: () => void
}

const SidebarToggle = forwardRef<HTMLButtonElement, SidebarToggleProps>(
  ({ onClick, ...props }, ref) => {
    return (
      <IconButton ref={ref} onClick={onClick} edge="start" {...props}>
        <MenuIcon />
      </IconButton>
    )
  }
)
SidebarToggle.displayName = 'SidebarToggle'

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarSection,
  SidebarSeparator,
  SidebarToggle,
}
export type { SidebarItem, SidebarProps }
