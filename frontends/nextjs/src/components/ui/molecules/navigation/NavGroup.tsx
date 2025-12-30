'use client'

import {
  Box,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { forwardRef, ReactNode, useState } from 'react'

import { ExpandLess, ExpandMore } from '@/fakemui/icons'

export interface NavGroupProps {
  label: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  disabled?: boolean
  divider?: boolean
  className?: string
}

const NavGroup = forwardRef<HTMLDivElement, NavGroupProps>(
  (
    { label, icon, children, defaultOpen = false, disabled = false, divider = false, ...props },
    ref
  ) => {
    const [open, setOpen] = useState(defaultOpen)

    const handleToggle = () => {
      if (!disabled) {
        setOpen(prev => !prev)
      }
    }

    return (
      <Box ref={ref} {...props}>
        {divider && <Divider sx={{ my: 1 }} />}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleToggle}
            disabled={disabled}
            sx={{
              borderRadius: 1,
              mx: 0.5,
              my: 0.25,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {icon && (
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: 'text.secondary',
                }}
              >
                {icon}
              </ListItemIcon>
            )}
            <ListItemText
              primary={label}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: 600,
                color: 'text.primary',
              }}
            />
            {open ? (
              <ExpandLess size={16} style={{ color: 'rgba(0,0,0,0.54)' }} />
            ) : (
              <ExpandMore size={16} style={{ color: 'rgba(0,0,0,0.54)' }} />
            )}
          </ListItemButton>
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: icon ? 3 : 1 }}>
            {children}
          </List>
        </Collapse>
      </Box>
    )
  }
)

NavGroup.displayName = 'NavGroup'

export { NavGroup }
